"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, CheckCircle2, Shield, Zap, X,
  MessageSquare, CalendarCheck, Lock,
  MapPin, ChevronRight, BadgeCheck, FileText, Info,
} from "lucide-react";
import lightLogo from "@/assets/logo.svg";
import darkLogo  from "@/assets/logo.png";
import { CATEGORY_TINTS } from "@/config/categoryConfig";
import {
  cashfree_plans,
  razorpay_subscription,
  stripe_subscription,
  verifyRazorpaySubscription
} from "@/services/payment.service";
import { last_parent_id } from "@/services/listing.service";
import termsData from "@/data/terms_and_conditions.json";
import { useCategory } from "@/context/CategoryContext";
import { Exo_2 } from "next/font/google";
import { currency_icon,formatPrice , getCountry} from '@/lib/currency_format'
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
// Payment methods & gateway by region
const PAYMENT_CONFIG = {
  in: {
    methods:   ["UPI", "Cards", "Net Banking", "Razorpay"],
    gateway:   "Razorpay",
    secureMsg: "Payments secured by Razorpay · venuebook.in never stores card details",
  },
  ae: {
    methods:   ["Cards", "Apple Pay", "Google Pay", "Stripe"],
    gateway:   "Stripe",
    secureMsg: "Payments secured by Stripe · venuebook.in never stores card details",
  },
};
// ─────────────────────────────────────────────────────────────────────────────
//  Razorpay checkout script loader
//  Razorpay doesn't ship an npm SDK for client-side checkout — it's loaded via
//  a <script> tag that exposes `window.Razorpay`. We load it once and reuse it.
// ─────────────────────────────────────────────────────────────────────────────
let razorpayScriptPromise = null;
function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}
// ─────────────────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────────────────
export default function PaymentPage() {
  const params   = useParams();
  const router   = useRouter();
  const locale   = params?.locale   || "en";
  const country  = params?.country  || "in";
  const category = params?.category || "venue";
  const tintKey    = CAT_KEY[category] || "venues";
  const tint       = CATEGORY_TINTS[tintKey] || CATEGORY_TINTS.venues;
  const catMeta    = CAT_META[category] || CAT_META.venue;
  const payConfig  = PAYMENT_CONFIG[country] || PAYMENT_CONFIG.in;
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
  const [quantity,        setQuantity]       = useState(1);
  const [showTermsModal,     setShowTermsModal]     = useState(false);
  const [mobileExpanded,     setMobileExpanded]     = useState(false);
    const [loading, setLoading] = useState(false);
    const countrys = getCountry() || {};

  // ── Hard-block browser back navigation on this page ──
  // Instead of letting the user navigate back and then redirecting them to
  // /home (which causes a visible flash/jump), we trap the back gesture by
  // continuously re-pushing the current URL onto the history stack. The user
  // never actually leaves this page via back/forward.
  useEffect(() => {
    // Seed an extra history entry so the very first back press is absorbed.
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

   const { activeCategory } = useCategory();
 
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
    const plan = await cashfree_plans(parentIdData , category);
    setPlans(plan?.data || []);
  } catch (error) {
    console.error("Failed to load plans:", error);
  }
};
useEffect(() => {
  if (!parentId) return;
  const fetchPlans = async () => {
    const plan = await cashfree_plans(parentId , category);
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
const basePrice    = Number(plan?.offer_amount || plan?.amount || 0);
const maxVenue    = Number(plan?.max_venue);
const percentage    = Number(plan?.percentage || 0);
// ── Plan type flags — drive whether the payment gateway is required ──
// 1. Free plan:       ₹0 subscription + 0% commission  → no gateway, straight to dashboard
// 2. Paid plan:        subscription amount > 0 (commission % may or may not be set) → go through gateway
// 3. Commission plan:  ₹0 subscription + commission % > 0 → no gateway, straight to dashboard
const isFreePlan       = basePrice === 0 && percentage === 0;
const isCommissionPlan = basePrice === 0 && percentage > 0;
const isPaidPlan       = basePrice > 0;
const skipPaymentGateway = isFreePlan || isCommissionPlan;
// For annual plans the API returns the yearly charge; derive per-month for display.
// quantity scales the per-unit basePrice up before GST is split out.
// Plan prices are GST-inclusive: the number from the API is the final charge,
// so GST is extracted from it rather than added on top.
const quantityPrice = basePrice * quantity;
const perMonth     = billing === "2" && quantityPrice > 0 ? Math.round(quantityPrice / 12) : quantityPrice;
const total        = Math.max(0, quantityPrice);      // actual charge: annual or monthly, GST-inclusive
const subtotal      = Math.round(total / 1.18);         // price excl. GST, for the breakdown line
const gst           = total - subtotal;                 // GST portion already inside `total`
// annualTotal is the (quantity-scaled) basePrice when billing === "2" — already GST-inclusive
const annualTotal  = billing === "2" ? quantityPrice : 0;
// Max discount % across annual plans — for the toggle label
const annualDiscount = (() => {
  const annualPlans = plans.filter((p) => String(p.plan_title) === "2");
  const discounts   = annualPlans.map((p) => Number(p.discount || 0)).filter((d) => d > 0);
  return discounts.length ? Math.max(...discounts) : 0;
})();
const fmt = (n) =>
  n === 0 ? "₹0" : `₹${n.toLocaleString("en-IN")}`;
  const toggleMode = useCallback((key) => {
    if (key === "enquiry") return; // Enquiry is mandatory and cannot be unchecked
    setSelectedModes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
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
  const handleActivate = () => {
    if (!agreed || activating) return;
    setActivating(true);
    // Free plan (₹0 + 0%) or Commission plan (₹0 + %) — no payment required
    if (skipPaymentGateway) {
      activateWithoutPayment();
      return;
    }
    // Paid plan — India goes through Razorpay
    razorpay_checkout(1);
  };
  // Activates the listing directly — without opening Razorpay or Stripe —
  // then routes the user onward.
  // paymentType tags *why* the gateway was skipped, so it's distinguishable
  // in storage/analytics later, and also decides where we send the user:
  //  - "no_payment_required": Free or Commission-only plan (nothing to charge)
  //                           → straight to the dashboard, same as before.
  //  - "payment_skipped":     user explicitly chose "Skip Payment" on a plan
  //                           that does have a charge attached
  //                           → the same subscription-success page the paid
  //                             Razorpay flow lands on, so the confirmation
  //                             experience is consistent either way.
  const activateWithoutPayment = async (paymentType = "no_payment_required") => {
    try {
      const payload = {
        selected: 1,
        selectedPlan,
        agreed,
        selectedModes: Array.from(selectedModes),
        coupon,
        billing,
        quantity,
        parent_venue_id: parentId,
        category,
      };
      await razorpay_subscription(payload);
      try { localStorage.setItem("vb_payment_type", paymentType); } catch (_) {}
      try { localStorage.removeItem("vb_pending_" + category); } catch (_) {}
      if (paymentType === "payment_skipped") {
        router.push(
          "/" + locale + "/" + country +
          "/start-listing/venue/subscription-success?payment_status=skipped"
        );
      } else {
        router.push("/" + locale + "/" + country + "/vendor/dashboard");
      }
    } catch (error) {
      console.error("Activation Error:", error);
    } finally {
      setActivating(false);
    }
  };
//   const razorpay_checkout = async (selected) => {
//   try {
//     setActivating(true);
//     const payload = {
//       selected,
//       selectedPlan,
//       agreed,
//       selectedModes: Array.from(selectedModes),
//       coupon,
//       billing,
//       quantity,
//       parent_venue_id: parentId,
//       category,
//     };
//     const res = await razorpay_subscription(payload);
//     const order = res.data;
//     if (
//       !order?.success ||
//       !order?.key_id ||
//       !order?.subscription_id
//     ) {
//       throw new Error("Unable to create Razorpay subscription");
//     }
//     const scriptReady = await loadRazorpayScript();
//     if (!scriptReady) {
//       throw new Error("Razorpay SDK failed to load");
//     }
//     const options = {
//       key: order.key_id,
//       subscription_id: order.subscription_id,
//       name: "VenueBook",
//       description: plan?.plan_name || "Subscription",
//       prefill: {
//         name: listingInfo?.ownerName || "",
//         email: listingInfo?.email || "",
//         contact: listingInfo?.phone || "",
//       },
//       theme: {
//         color: tint.hex,
//       },
   
//   handler: async function (response) {
//     try {
//       const verifyPayload = {
//         payment_id: response.razorpay_payment_id,
//         subscription_id: response.razorpay_subscription_id,
//         signature: response.razorpay_signature,
//       };
//       const verify = await verifyRazorpaySubscription(verifyPayload);
//       if (verify.data.success) {
//         localStorage.removeItem("vb_pending_" + category);
//          router.push("/" + locale + "/" + country + "/start-listing/venue/subscription-success?subscription_id="+verify.data.subscription_id);
//       } else {
//         alert("Payment verification failed.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Unable to verify payment.");
//     } finally {
//       setActivating(false);
//     }
//   },
//   modal: {
//     ondismiss() {
//       setActivating(false);
//     },
//   },
// };
//     const rzp = new window.Razorpay(options);
//     rzp.on("payment.failed", function (response) {
//       console.log(response.error);
//       setActivating(false);
//     });
//     rzp.open();
//   } catch (e) {
//     console.log(e);
//     setActivating(false);
//   }
// };
  // Explicit "Skip Payment" action — activates the listing immediately
  // without opening Razorpay or Stripe, regardless of plan price or country.
  // The subscription/commission terms still apply; this only defers the
  // checkout step itself.
  
// const razorpay_checkout = async (selected) => {
//   let paymentWindow = null;
//   let messageHandler = null;
//   let popupChecker = null;

//   try {
//     setActivating(true);

//     const payload = {
//       selected,
//       selectedPlan,
//       agreed,
//       selectedModes: Array.from(selectedModes),
//       coupon,
//       billing,
//       quantity,
//       parent_venue_id: parentId,
//       category,
//     };

//     const res = await razorpay_subscription(payload);
//     const data = res.data;

//     console.log("Razorpay response:", data);

//     if (
//       !data?.success ||
//       !data?.subscription?.payment_link_url
//     ) {
//       throw new Error(
//         data?.message ||
//           "Unable to create Razorpay payment link"
//       );
//     }

//     /*
//      * Save pending subscription
//      */
//     localStorage.setItem(
//       "vb_pending_subscription",
//       JSON.stringify({
//         subscription_id: data.subscription.id,
//         subscription_code:
//           data.subscription.subscription_code,
//         payment_link_id:
//           data.subscription.payment_link_id,
//         category,
//         amount:
//           data.pricing?.total_amount || 0,
//         currency:
//           data.pricing?.currency || "INR",
//       })
//     );

//     /*
//      * Listen for Razorpay callback message
//      */
//     messageHandler = (event) => {

//       // Security check
//       const allowedOrigin =
//         process.env.NEXT_PUBLIC_API_URL ||
//         "https://api.venuebook.in";

//       /*
//        * The callback page is hosted on api.venuebook.in,
//        * so message origin will be API origin.
//        */
//       if (
//         event.origin !== allowedOrigin
//       ) {
//         console.warn(
//           "Ignored message from:",
//           event.origin
//         );

//         return;
//       }

//       const data = event.data;

//       if (
//         data?.type !==
//         "RAZORPAY_PAYMENT_RESULT"
//       ) {
//         return;
//       }

//       console.log(
//         "Razorpay payment result:",
//         data
//       );

//       /*
//        * Remove listener
//        */
//       window.removeEventListener(
//         "message",
//         messageHandler
//       );

//       if (popupChecker) {
//         clearInterval(popupChecker);
//       }

//       /*
//        * Payment successful
//        */
//       if (data.success) {

//         setActivating(false);

//         /*
//          * Close popup if still open
//          */
//         if (
//           paymentWindow &&
//           !paymentWindow.closed
//         ) {
//           paymentWindow.close();
//         }

//         /*
//          * Redirect parent VenueBook page
//          */
//         router.push(
//           `/${locale}/${country}/start-listing/venue/subscription-success` +
//           `?subscription_id=${encodeURIComponent(
//             data.subscription_id
//           )}` +
//           `&status=${encodeURIComponent(
//             data.status
//           )}` +
//           `&payment_id=${encodeURIComponent(
//             data.payment_id || ""
//           )}`
//         );

//       } else {

//         setActivating(false);

//         if (
//           paymentWindow &&
//           !paymentWindow.closed
//         ) {
//           paymentWindow.close();
//         }

//         alert(
//           "Payment could not be confirmed."
//         );
//       }
//     };

//     window.addEventListener(
//       "message",
//       messageHandler
//     );

//     /*
//      * Open Razorpay popup
//      */
//     paymentWindow = window.open(
//       data.subscription.payment_link_url,
//       "RazorpayPayment",
//       [
//         "width=500",
//         "height=750",
//         "left=500",
//         "top=100",
//         "resizable=yes",
//         "scrollbars=yes",
//       ].join(",")
//     );

//     /*
//      * Popup blocked
//      */
//     if (!paymentWindow) {

//       window.removeEventListener(
//         "message",
//         messageHandler
//       );

//       throw new Error(
//         "Popup blocked. Please allow popups for VenueBook."
//       );
//     }

//     paymentWindow.focus();

//     /*
//      * Detect user manually closing popup
//      */
//     popupChecker = setInterval(() => {

//       if (
//         paymentWindow &&
//         paymentWindow.closed
//       ) {

//         clearInterval(popupChecker);

//         window.removeEventListener(
//           "message",
//           messageHandler
//         );

//         setActivating(false);

//         console.log(
//           "Razorpay popup closed by user"
//         );
//       }

//     }, 1000);

//   } catch (error) {

//     console.error(
//       "Razorpay checkout error:",
//       error
//     );

//     if (popupChecker) {
//       clearInterval(popupChecker);
//     }

//     if (messageHandler) {
//       window.removeEventListener(
//         "message",
//         messageHandler
//       );
//     }

//     if (
//       paymentWindow &&
//       !paymentWindow.closed
//     ) {
//       paymentWindow.close();
//     }

//     setActivating(false);

//     alert(
//       error?.message ||
//         "Unable to open Razorpay payment page."
//     );
//   }
// };
// const razorpay_checkout = async (selected) => {
//   let paymentWindow = null;
//   let popupChecker = null;
//   let messageHandler = null;

//   try {
//     setActivating(true);

//     const payload = {
//       selected,
//       selectedPlan,
//       agreed,
//       selectedModes: Array.from(selectedModes),
//       coupon,
//       billing,
//       quantity,
//       parent_venue_id: parentId,
//       category,
//     };

//     const res = await razorpay_subscription(payload);
//     const data = res.data;

//     console.log("Razorpay response:", data);

//     if (
//       !data?.success ||
//       !data?.subscription?.payment_link_url
//     ) {
//       throw new Error(
//         data?.message ||
//           "Unable to create Razorpay payment link"
//       );
//     }

//     const paymentUrl =
//       data.subscription.payment_link_url;

//     /*
//      * Save pending subscription
//      */
//     localStorage.setItem(
//       "vb_pending_subscription",
//       JSON.stringify({
//         subscription_id: data.subscription.id,
//         subscription_code:
//           data.subscription.subscription_code,
//         payment_link_id:
//           data.subscription.payment_link_id,
//         category,
//         amount:
//           data.pricing?.total_amount || 0,
//         currency:
//           data.pricing?.currency || "INR",
//       })
//     );

//     /*
//      * Listen for callback result
//      */
//     messageHandler = (event) => {
//       console.log(
//         "Razorpay message received:",
//         event
//       );

//       /*
//        * Security check
//        *
//        * Your callback page is hosted on:
//        * https://api.venuebook.in
//        */
//       const allowedOrigin =
//         process.env.NEXT_PUBLIC_API_URL ||
//         "https://api.venuebook.in";

//       if (event.origin !== allowedOrigin) {
//         console.warn(
//           "Ignored message from:",
//           event.origin
//         );
//         return;
//       }

//       const paymentData = event.data;

//       if (
//         paymentData?.type !==
//         "RAZORPAY_PAYMENT_RESULT"
//       ) {
//         return;
//       }

//       console.log(
//         "Razorpay payment result:",
//         paymentData
//       );

//       //  console.log(
//       //   "Razorpay Signatuire result:",
//       //   signature_id
//       // );

//       /*
//        * Remove listener
//        */
//       window.removeEventListener(
//         "message",
//         messageHandler
//       );

//       /*
//        * Stop popup checker
//        */
//       if (popupChecker) {
//         clearInterval(popupChecker);
//       }

//       /*
//        * Close Razorpay popup
//        */
//       if (
//         paymentWindow &&
//         !paymentWindow.closed
//       ) {
//         paymentWindow.close();
//       }

//       /*
//        * Payment successful
//        */
//       if (paymentData.success) {
//         setActivating(false);

//         const subscriptionId =
//           paymentData.subscription_id || "";

//         const status =
//           paymentData.status || "paid";

//         const paymentId =
//           paymentData.payment_id || "";
          
//           const signature_id =
//           paymentData.signature_id || "";

          

//         /*
//          * Final success URL
//          */
//         const successUrl =
//           `/${locale}/${country}` +
//           `/start-listing/venue/subscription-success` +
//           `?subscription_id=${encodeURIComponent(
//             subscriptionId
//           )}` +
//           `&status=${encodeURIComponent(
//             status
//           )}` +
//           `&payment_id=${encodeURIComponent(
//             paymentId
//           )}`+
//           `&signature_id=${encodeURIComponent(
//             signature_id
//           )}`;

//         console.log(
//           "Redirecting to:",
//           successUrl
//         );

//         router.push(successUrl);

//         return;
//       }

//       /*
//        * Payment failed
//        */
//       setActivating(false);

//       alert(
//         "Payment could not be confirmed."
//       );
//     };

//     window.addEventListener(
//       "message",
//       messageHandler
//     );

//     /*
//      * Open Razorpay popup
//      */
//     paymentWindow = window.open(
//       paymentUrl,
//       "RazorpayPayment",
//       [
//         "width=500",
//         "height=750",
//         "left=500",
//         "top=100",
//         "resizable=yes",
//         "scrollbars=yes",
//         "status=no",
//         "toolbar=no",
//         "menubar=no",
//       ].join(",")
//     );

//     /*
//      * Popup blocked
//      */
//     if (!paymentWindow) {
//       window.removeEventListener(
//         "message",
//         messageHandler
//       );

//       throw new Error(
//         "Popup blocked. Please allow popups for VenueBook."
//       );
//     }

//     paymentWindow.focus();

//     /*
//      * Check whether user manually
//      * closed the popup.
//      */
//     popupChecker = setInterval(() => {
//       if (
//         paymentWindow &&
//         paymentWindow.closed
//       ) {
//         clearInterval(popupChecker);

//         window.removeEventListener(
//           "message",
//           messageHandler
//         );

//         setActivating(false);

//         console.log(
//           "Razorpay popup closed by user"
//         );
//       }
//     }, 1000);

//   } catch (error) {
//     console.error(
//       "Razorpay checkout error:",
//       error
//     );

//     if (popupChecker) {
//       clearInterval(popupChecker);
//     }

//     if (messageHandler) {
//       window.removeEventListener(
//         "message",
//         messageHandler
//       );
//     }

//     if (
//       paymentWindow &&
//       !paymentWindow.closed
//     ) {
//       paymentWindow.close();
//     }

//     setActivating(false);

//     alert(
//       error?.message ||
//         "Unable to open Razorpay payment page."
//     );
//   }
// };

// const razorpay_checkout = async (selected) => {
//   let messageHandler = null;

//   try {
//     setActivating(true);

//     // =========================================================
//     // 1. Payload
//     // =========================================================

//     const payload = {
//       selected,
//       selectedPlan,
//       agreed,
//       selectedModes: Array.from(selectedModes),
//       coupon,
//       billing,
//       quantity,
//       parent_venue_id: parentId,
//       category,
//     };

//     // =========================================================
//     // 2. Create Razorpay authorization order
//     // =========================================================

//     const res = await razorpay_subscription(payload);

//     const data = res.data;

//     console.log("Razorpay authorization response:", data);

//     if (
//       !data?.success ||
//       !data?.key_id ||
//       !data?.order?.id
//     ) {
//       throw new Error(
//         data?.message ||
//           "Unable to create Razorpay authorization order"
//       );
//     }

//     const razorpayOrderId =
//       data.order.id;

//     const localSubscriptionId =
//       data.subscription?.id || "";

//     const subscriptionCode =
//       data.subscription?.subscription_code || "";

//     const customerId =
//       data.customer?.id || "";

//     // =========================================================
//     // 3. Save pending subscription
//     // =========================================================

//     localStorage.setItem(
//       "vb_pending_subscription",
//       JSON.stringify({
//         subscription_id:
//           localSubscriptionId,

//         subscription_code:
//           subscriptionCode,

//         razorpay_order_id:
//           razorpayOrderId,

//         razorpay_customer_id:
//           customerId,

//         category,

//         quantity,

//         amount:
//           data.pricing?.total_amount || 0,

//         currency:
//           data.pricing?.currency || "INR",
//       })
//     );

//     // =========================================================
//     // 4. Load Razorpay SDK
//     // =========================================================

//     const scriptReady =
//       await loadRazorpayScript();

//     if (!scriptReady) {
//       throw new Error(
//         "Razorpay SDK failed to load"
//       );
//     }

//     // =========================================================
//     // 5. Razorpay Checkout
//     // =========================================================

//     const options = {
//       key: data.key_id,

//       order_id: razorpayOrderId,

//       amount:
//         data.order.amount,

//       currency:
//         data.order.currency || "INR",

//       name: "VenueBook",

//       description:
//         "VenueBook Recurring Subscription",

//       // ---------------------------------------------------------
//       // Customer details
//       // ---------------------------------------------------------

//       prefill: {
//         name:
//           listingInfo?.ownerName ||
//           "",

//         email:
//           listingInfo?.email ||
//           "",

//         contact:
//           listingInfo?.phone ||
//           "",
//       },

//       // ---------------------------------------------------------
//       // Recurring authorization
//       // ---------------------------------------------------------

//       recurring: true,

//       customer_id:
//         customerId,

//       // ---------------------------------------------------------
//       // Theme
//       // ---------------------------------------------------------

//       theme: {
//         color:
//           tint?.hex ||
//           "#a44bf3",
//       },

//       // ---------------------------------------------------------
//       // Modal
//       // ---------------------------------------------------------

//       modal: {
//         escape: true,

//         ondismiss: function () {
//           console.log(
//             "Razorpay Checkout closed"
//           );

//           setActivating(false);
//         },
//       },

//       // =========================================================
//       // 6. Successful authorization
//       // =========================================================

//       handler: async function (response) {
//         try {
//           console.log(
//             "Razorpay success response:",
//             response
//           );

//           const paymentId =
//             response?.razorpay_payment_id ||
//             "";

//           const orderId =
//             response?.razorpay_order_id ||
//             razorpayOrderId;

//           const signature =
//             response?.razorpay_signature ||
//             "";
            
            

//           if (
//             !paymentId ||
//             !orderId ||
//             !signature
//           ) {
//             throw new Error(
//               "Incomplete Razorpay payment response"
//             );
//           }

//           const tokenId =
//       response.razorpay_token_id ||
//       response.token_id ||
//       null;

//     console.log("Payment ID:", paymentId);
//     console.log("Order ID:", orderId);
//     console.log("Signature:", signature);
//     console.log("Token ID:", tokenId);

//     if (!tokenId) {
//       console.error(
//         "Razorpay token ID was not returned"
//       );

//       // Do NOT mark recurring subscription active
//       return;
//     }

//     await saveRazorpayToken({
//       subscription_table_id:
//         data.subscription.id,

//       payment_id: paymentId,

//       order_id: orderId,

//       signature,

//       token_id: tokenId,
//     });

//           // =====================================================
//           // 7. Verify payment on backend
//           // =====================================================

//           const verifyPayload = {
//             payment_id:
//               paymentId,

//             order_id:
//               orderId,

//             signature:
//               signature,

//             subscription_id:
//               subscriptionCode,
//             subscription_table_id:
//               localSubscriptionId,
//           };

//           console.log(
//             "Verifying Razorpay:",
//             verifyPayload
//           );

//           const verify =
//             await verifyRazorpaySubscription(
//               verifyPayload
//             );

//           console.log(
//             "Razorpay verification:",
//             verify?.data
//           );

//           if (
//             !verify?.data?.success
//           ) {
//             throw new Error(
//               verify?.data?.message ||
//                 "Payment verification failed"
//             );
//           }

//           // =====================================================
//           // 8. Remove pending data
//           // =====================================================

//           localStorage.removeItem(
//             "vb_pending_subscription"
//           );

//           localStorage.removeItem(
//             "vb_payment_type"
//           );

//           localStorage.removeItem(
//             "vb_pending_category"
//           );

//           // =====================================================
//           // 9. Get subscription ID
//           // =====================================================

//           const subscriptionId =
//             verify?.data?.subscription_id ||
//             localSubscriptionId;

//           const status =
//             verify?.data?.status ||
//             "paid";

//           const verifiedPaymentId =
//             verify?.data?.payment_id ||
//             paymentId;

//           // =====================================================
//           // 10. Success URL
//           // =====================================================

//           const successUrl =
//             `/${locale}/${country}` +
//             `/start-listing/venue/subscription-success` +
//             `?subscription_id=${encodeURIComponent(
//               subscriptionId
//             )}` +
//             `&status=${encodeURIComponent(
//               status
//             )}` +
//             `&payment_id=${encodeURIComponent(
//               verifiedPaymentId
//             )}`;

//           console.log(
//             "Redirecting to:",
//             successUrl
//           );

//           setActivating(false);

//           router.push(
//             successUrl
//           );

//         } catch (error) {
//           console.error(
//             "Razorpay verification error:",
//             error
//           );

//           setActivating(false);

//           alert(
//             error?.message ||
//               "Unable to verify payment."
//           );
//         }
//       },
//     };

//     // =========================================================
//     // 11. Create Razorpay instance
//     // =========================================================

//     const rzp =
//       new window.Razorpay(
//         options
//       );

//     // =========================================================
//     // 12. Payment failed
//     // =========================================================

//     rzp.on(
//       "payment.failed",
//       function (response) {
//         console.error(
//           "Razorpay payment failed:",
//           response?.error
//         );

//         setActivating(false);

//         alert(
//           response?.error?.description ||
//             "Payment failed. Please try again."
//         );
//       }
//     );

//     // =========================================================
//     // 13. Open Razorpay popup
//     // =========================================================

//     rzp.open();

//   } catch (error) {
//     console.error(
//       "Razorpay checkout error:",
//       error
//     );

//     setActivating(false);

//     alert(
//       error?.message ||
//         "Unable to open Razorpay payment page."
//     );
//   }
// };
// const razorpay_checkout = async (selected) => {
//   let rzp = null;

//   try {
//     setActivating(true);

//     // =========================================================
//     // 1. Payload
//     // =========================================================

//     const payload = {
//       selected,
//       selectedPlan,
//       agreed,
//       selectedModes: Array.from(selectedModes),
//       coupon,
//       billing,
//       quantity,
//       parent_venue_id: parentId,
//       category,
//     };

//     // =========================================================
//     // 2. Create Razorpay authorization order
//     // =========================================================

//     const res = await razorpay_subscription(payload);
//     const data = res?.data;

//     console.log(
//       "Razorpay authorization response:",
//       data
//     );

//     if (
//       !data?.success ||
//       !data?.key_id ||
//       !data?.order?.id
//     ) {
//       throw new Error(
//         data?.message ||
//           "Unable to create Razorpay authorization order"
//       );
//     }

//     const razorpayOrderId =
//       data.order.id;

//     const localSubscriptionId =
//       data.subscription?.id || "";

//     const subscriptionCode =
//       data.subscription?.subscription_code || "";

//     const customerId =
//       data.customer?.id || "";

//     if (!localSubscriptionId) {
//       throw new Error(
//         "Local subscription ID is missing"
//       );
//     }

//     // =========================================================
//     // 3. Save pending subscription
//     // =========================================================

//     localStorage.setItem(
//       "vb_pending_subscription",
//       JSON.stringify({
//         subscription_id:
//           localSubscriptionId,

//         subscription_code:
//           subscriptionCode,

//         razorpay_order_id:
//           razorpayOrderId,

//         razorpay_customer_id:
//           customerId,

//         category,

//         quantity,

//         amount:
//           data.pricing?.total_amount || 0,

//         currency:
//           data.pricing?.currency || "INR",
//       })
//     );

//     // =========================================================
//     // 4. Load Razorpay SDK
//     // =========================================================

//     const scriptReady =
//       await loadRazorpayScript();

//     if (!scriptReady) {
//       throw new Error(
//         "Razorpay SDK failed to load"
//       );
//     }

//     if (!window.Razorpay) {
//       throw new Error(
//         "Razorpay SDK is not available"
//       );
//     }

//     // =========================================================
//     // 5. Razorpay Checkout options
//     // =========================================================

//     const options = {
//       key: data.key_id,

//       order_id: razorpayOrderId,

//       amount:
//         Number(data.order.amount),

//       currency:
//         data.order.currency || "INR",

//       name: "VenueBook",

//       description:
//         "VenueBook Recurring Subscription",

//       // =======================================================
//       // IMPORTANT: Recurring authorization
//       // =======================================================

//       recurring: true,

//       customer_id:
//         customerId || undefined,

//       // =======================================================
//       // Customer
//       // =======================================================

//       prefill: {
//         name:
//           listingInfo?.ownerName ||
//           "",

//         email:
//           listingInfo?.email ||
//           "",

//         contact:
//           listingInfo?.phone ||
//           "",
//       },

//       // =======================================================
//       // Theme
//       // =======================================================

//       theme: {
//         color:
//           tint?.hex ||
//           "#a44bf3",
//       },

//       // =======================================================
//       // Modal
//       // =======================================================

//       modal: {
//         escape: true,

//         confirm_close: true,

//         ondismiss: function () {
//           console.log(
//             "Razorpay Checkout closed"
//           );

//           setActivating(false);
//         },
//       },

//       // =======================================================
//       // SUCCESS
//       // =======================================================

//       handler: async function (response) {
//         try {
//           console.log(
//             "================================"
//           );

//           console.log(
//             "Razorpay SUCCESS RESPONSE"
//           );

//           console.log(
//             response
//           );

//           console.log(
//             "================================"
//           );

//           const paymentId =
//             response?.razorpay_payment_id ||
//             "";

//           const orderId =
//             response?.razorpay_order_id ||
//             razorpayOrderId;

//           const signature =
//             response?.razorpay_signature ||
//             "";

//           // =====================================================
//           // Token
//           // =====================================================

//           const tokenId =
//             response?.razorpay_token_id ||
//             response?.token_id ||
//             response?.razorpay_token ||
//             null;

//           console.log(
//             "Payment ID:",
//             paymentId
//           );

//           console.log(
//             "Order ID:",
//             orderId
//           );

//           console.log(
//             "Signature:",
//             signature
//           );

//           console.log(
//             "Token ID:",
//             tokenId
//           );

//           // =====================================================
//           // Validate basic Razorpay response
//           // =====================================================

//           if (
//             !paymentId ||
//             !orderId ||
//             !signature
//           ) {
//             throw new Error(
//               "Incomplete Razorpay payment response"
//             );
//           }

//           // =====================================================
//           // IMPORTANT
//           //
//           // First verify payment signature on backend.
//           // Do NOT save token before verification.
//           // =====================================================

//           const verifyPayload = {
//             payment_id:
//               paymentId,

//             order_id:
//               orderId,

//             signature:
//               signature,

//             // This is YOUR local subscription code
//             subscription_id:
//               subscriptionCode,

//             // This is YOUR DB ID
//             subscription_table_id:
//               localSubscriptionId,

//             // Token may be null depending on
//             // Razorpay response.
//             token_id:
//               tokenId,
//           };

//           console.log(
//             "Verifying Razorpay:",
//             verifyPayload
//           );

//           const verify =
//             await verifyRazorpaySubscription(
//               verifyPayload
//             );

//           console.log(
//             "Razorpay verification response:",
//             verify?.data
//           );

//           if (
//             !verify?.data?.success
//           ) {
//             throw new Error(
//               verify?.data?.message ||
//                 "Payment verification failed"
//             );
//           }

//           // =====================================================
//           // Get token from verification response
//           //
//           // Backend may receive/store it through webhook/API.
//           // =====================================================

//           const verifiedTokenId =
//             verify?.data?.token_id ||
//             tokenId ||
//             null;

//           console.log(
//             "Verified Token ID:",
//             verifiedTokenId
//           );

//           // =====================================================
//           // Save token ONLY if one was actually returned
//           // =====================================================

//           if (verifiedTokenId) {
//             try {
//               const tokenResponse =
//                 await saveRazorpayToken({
//                   subscription_table_id:
//                     localSubscriptionId,

//                   payment_id:
//                     paymentId,

//                   order_id:
//                     orderId,

//                   signature:
//                     signature,

//                   token_id:
//                     verifiedTokenId,
//                 });

//               console.log(
//                 "Razorpay token saved:",
//                 tokenResponse?.data ||
//                   tokenResponse
//               );
//             } catch (tokenError) {
//               console.error(
//                 "Failed to save Razorpay token:",
//                 tokenError
//               );

//               /*
//                * Do not immediately fail the payment here.
//                *
//                * The authorization payment itself has already
//                * been verified. Token information may also arrive
//                * through Razorpay webhook/API.
//                */
//             }
//           } else {
//             console.warn(
//               "Razorpay token ID not available in Checkout response."
//             );

//             /*
//              * Do NOT generate a token yourself.
//              *
//              * Do NOT use payment_id as token_id.
//              *
//              * The backend/webhook should obtain the token
//              * according to the Razorpay recurring flow.
//              */
//           }

//           // =====================================================
//           // Remove pending subscription
//           // =====================================================

//           localStorage.removeItem(
//             "vb_pending_subscription"
//           );

//           localStorage.removeItem(
//             "vb_payment_type"
//           );

//           localStorage.removeItem(
//             "vb_pending_category"
//           );

//           // =====================================================
//           // Final subscription ID
//           // =====================================================

//           const subscriptionId =
//             verify?.data?.subscription_id ||
//             localSubscriptionId;

//           // =====================================================
//           // Final status
//           // =====================================================

//           const status =
//             verify?.data?.status ||
//             "paid";

//           // =====================================================
//           // Final payment ID
//           // =====================================================

//           const verifiedPaymentId =
//             verify?.data?.payment_id ||
//             paymentId;

//           // =====================================================
//           // Redirect
//           // =====================================================

//           const successUrl =
//             `/${locale}/${country}` +
//             `/start-listing/venue/subscription-success` +
//             `?subscription_id=${encodeURIComponent(
//               subscriptionId
//             )}` +
//             `&status=${encodeURIComponent(
//               status
//             )}` +
//             `&payment_id=${encodeURIComponent(
//               verifiedPaymentId
//             )}`;

//           console.log(
//             "Redirecting to:",
//             successUrl
//           );

//           setActivating(false);

//           router.push(
//             successUrl
//           );

//         } catch (error) {
//           console.error(
//             "Razorpay verification error:",
//             error
//           );

//           setActivating(false);

//           alert(
//             error?.message ||
//               "Unable to verify payment."
//           );
//         }
//       },
//     };

//     // =========================================================
//     // 6. Create Razorpay instance
//     // =========================================================

//     rzp =
//       new window.Razorpay(options);

//     // =========================================================
//     // 7. Payment failed
//     // =========================================================

//     rzp.on(
//       "payment.failed",
//       function (response) {
//         console.error(
//           "Razorpay payment failed:",
//           response?.error
//         );

//         setActivating(false);

//         alert(
//           response?.error?.description ||
//             "Payment failed. Please try again."
//         );
//       }
//     );

//     // =========================================================
//     // 8. Open Checkout
//     // =========================================================

//     rzp.open();

//   } catch (error) {
//     console.error(
//       "Razorpay checkout error:",
//       error
//     );

//     setActivating(false);

//     alert(
//       error?.message ||
//         "Unable to open Razorpay payment page."
//     );
//   }
// };
const razorpay_checkout = async (selected) => {
  try {
    setActivating(true);

    const payload = {
      selected,
      selectedPlan,
      agreed,
      selectedModes: Array.from(selectedModes),
      coupon,
      billing,
      quantity,
      parent_venue_id: parentId,
      category,
    };

    // Backend creates: Razorpay Customer -> Razorpay Order (with token
    // intent) -> local subscription row. Token itself is NOT returned here.
    const res = await razorpay_subscription(payload);
    const data = res?.data;

    if (!data?.success || !data?.key_id || !data?.order?.id) {
      throw new Error(data?.message || "Unable to create payment order");
    }

    const scriptReady = await loadRazorpayScript();
    if (!scriptReady || !window.Razorpay) {
      throw new Error("Razorpay SDK failed to load");
    }

    // Keep a pending record in case the user closes the tab mid-flow —
    // lets you reconcile status on next visit / via webhook.
    localStorage.setItem(
      "vb_pending_subscription",
      JSON.stringify({
        subscription_id: data.subscription?.id || "",
        subscription_code: data.subscription?.subscription_code || "",
        razorpay_order_id: data.order.id,
        razorpay_customer_id: data.customer?.id || "",
        category,
        quantity,
        amount: data.pricing?.total_amount || 0,
        currency: data.pricing?.currency || "INR",
      })
    );

    const options = {
      key: data.key_id,
      order_id: data.order.id,
      amount: Number(data.order.amount),
      currency: data.order.currency || "INR",
      name: "VenueBook",
      description: "VenueBook Recurring Subscription",
      // Tells Razorpay this order is a token-registration charge, not a
      // one-off payment — required for later auto-debits.
      recurring: true,
      customer_id: data.customer?.id || undefined,
      prefill: {
        name: listingInfo?.ownerName || "",
        email: listingInfo?.email || "",
        contact: listingInfo?.phone || "",
      },
      theme: { color: tint?.hex || "#a44bf3" },
      modal: {
        escape: true,
        confirm_close: true,
        ondismiss: () => setActivating(false),
      },
      // IMPORTANT: this handler only ever receives payment_id / order_id /
      // signature. Never look for a token here — it does not exist client
      // side. Token retrieval happens on the backend via webhook or a
      // server-to-server Payment Fetch call inside verifyRazorpaySubscription.
      handler: async (response) => {
        try {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

          if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            throw new Error("Incomplete Razorpay payment response");
          }

          const verify = await verifyRazorpaySubscription({
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            signature: razorpay_signature,
            subscription_id: data.subscription?.subscription_code,
            subscription_table_id: data.subscription?.id,
          });

          if (!verify?.data?.success) {
            throw new Error(verify?.data?.message || "Payment verification failed");
          }

          localStorage.removeItem("vb_pending_subscription");
          localStorage.removeItem("vb_payment_type");
          localStorage.removeItem("vb_pending_category");

          const subscriptionId = verify.data.subscription_id || data.subscription?.id;
          const status = verify.data.status || "paid";
          const paymentId = verify.data.payment_id || razorpay_payment_id;

          setActivating(false);
          router.push(
            `/${locale}/${country}/start-listing/venue/subscription-success` +
            `?subscription_id=${encodeURIComponent(subscriptionId)}` +
            `&status=${encodeURIComponent(status)}` +
            `&payment_id=${encodeURIComponent(paymentId)}`
          );
        } catch (error) {
          console.error("Razorpay verification error:", error);
          setActivating(false);
          alert(error?.message || "Unable to verify payment.");
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      console.error("Razorpay payment failed:", response?.error);
      setActivating(false);
      alert(response?.error?.description || "Payment failed. Please try again.");
    });
    rzp.open();
  } catch (error) {
    console.error("Razorpay checkout error:", error);
    setActivating(false);
    alert(error?.message || "Unable to open Razorpay payment page.");
  }
};

  const handleSkipPayment = () => {
    if (!agreed || activating) return;
    setActivating(true);
    activateWithoutPayment("payment_skipped");
  };
  const openTerms  = () => setShowTermsModal(true);
  const closeTerms = () => setShowTermsModal(false);
  const acceptTerms = () => { setAgreed(true); setShowTermsModal(false); };
   const handleSubscribe = async () => {
    if (!agreed || activating) return;
    // Free plan (₹0 + 0%) or Commission plan (₹0 + %) — no Stripe checkout required
    if (skipPaymentGateway) {
      setActivating(true);
      await activateWithoutPayment();
      return;
    }
    try {
      setLoading(true);
      const res = await stripe_subscription({
         selectedPlan,
    category,
    parent_venue_id: parentId,
    selectedModes: Array.from(selectedModes),
    quantity,
      });
   
      if (res.data.success) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };
  // Single source of truth for which gateway flow drives the primary CTA —
  // India (id 2) → Razorpay (handleActivate), everywhere else → Stripe (handleSubscribe).
  const handlePrimaryCta = countrys?.id === 2 ? handleActivate : handleSubscribe;
  const summaryProps = {
    plan, billing, basePrice, perMonth, gst, total, annualTotal, selectedModes,
    agreed, activating,
    isFreePlan, isCommissionPlan, isPaidPlan,
    quantity, onIncreaseQty: () => setQuantity((q) => Math.min(20, q + 1)),
    onDecreaseQty: () => setQuantity((q) => Math.max(1, q - 1)),
    onActivate:   handleActivate,
    onPayLater:   handleSkipPayment,
    onOpenTerms:  openTerms,
    tint, fmt, payConfig,loading,
  handleSubscribe,
  handlePrimaryCta,
  countrys,
  subtotal
  };
 //check Year Enabled 
 const hasAnnualPlans = plans.some(
  p => String(p.plan_title) === "2"
);
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
                aria-label="venuebook.in home"
                className="flex-shrink-0 transition-opacity hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-md"
              >
                <Image
                  src={isDark ? darkLogo : lightLogo}
                  alt="venuebook.in"
                  height={32}
                  className="h-7 sm:h-8 w-auto object-contain min-w-[88px]"
                  priority
                />
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
          <div className="max-w-6xl mx-auto px-5 sm:px-10 py-5 sm:py-7">
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
                  {listingInfo?.title || "Complete Your Subscription"}
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Choose a plan to activate your listing
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
        <main className="max-w-6xl mx-auto px-5 sm:px-10 pt-7 sm:pt-8 pb-44 lg:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-6 xl:gap-10 items-start">
            {/* ── LEFT ──────────────────────────────────────────── */}
            <div className="space-y-8 sm:space-y-9 min-w-0">
              {/* Booking mode */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0"
                    style={{ background: tint.hex }}>1</span>
                  <div>
                    <h2 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
                      How should guests reach you?
                    </h2>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      Pick one or more — changeable anytime from your dashboard.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {BOOKING_MODES.map((mode) => {
                    const active    = selectedModes.has(mode.key);
                    const mandatory = mode.key === "enquiry";
                    return (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => toggleMode(mode.key)}
                        disabled={mandatory}
                        className={[
                          "relative text-start p-4 rounded-2xl border transition-all duration-200 min-w-0",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                          mandatory ? "cursor-default" : "",
                          active
                            ? "bg-white dark:bg-gray-900"
                            : "bg-white/60 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-900/70 hover:border-gray-200 dark:hover:border-gray-700",
                        ].join(" ")}
                        style={active ? {
                          borderColor: mode.color,
                          boxShadow:   "0 0 0 1px " + mode.color + "30, 0 6px 20px " + mode.color + "12",
                        } : {}}
                      >
                        {/* Check / mandatory badge */}
                        {mandatory ? (
                          <span
                            className="absolute top-3 end-3 text-[8px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                            style={{ color: mode.color, background: mode.color + "18", border: "1px solid " + mode.color + "30" }}
                          >
                            Required
                          </span>
                        ) : (
                          <span
                            className="absolute top-3 end-3 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200"
                            style={active
                              ? { background: mode.color, borderColor: mode.color }
                              : { borderColor: "#d1d5db" }
                            }
                          >
                            {active && <Check size={7} strokeWidth={3.5} className="text-white" />}
                          </span>
                        )}
                        {/* Icon bubble */}
                        <span
                          className="inline-flex w-9 h-9 rounded-2xl items-center justify-center mb-3 transition-all duration-200"
                          style={{
                            background: active ? mode.color + "18" : "rgba(156,163,175,0.10)",
                            border:     active ? "1px solid " + mode.color + "25" : "1px solid transparent",
                          }}
                        >
                          <mode.Icon size={16} style={{ color: active ? mode.color : "#9ca3af" }} />
                        </span>
                        <p className={[
                          "text-[13px] font-bold leading-tight",
                          active ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400",
                        ].join(" ")}>
                          {mode.label}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 leading-snug">
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
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0"
                      style={{ background: tint.hex }}>2</span>
                    <div className="min-w-0">
                      <h2 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
                        Choose your plan
                      </h2>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        Start free. Scale when you&apos;re ready.
                      </p>
                    </div>
                  </div>
                  {/* Billing toggle — hidden when only a single billing cycle (plan_title "1") exists for this plan set */}
                  {hasAnnualPlans && (
                  <div className="flex items-center p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 flex-shrink-0 gap-0.5">
                    {[
                      { key: "1", label: "Monthly" },
                      { key: "2", label: "Annual"  },
                    ].map((b) => (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => { setBilling(b.key); setCouponDiscount(0); setCouponStatus(null); }}
                        className={[
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                          billing === b.key
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
                        ].join(" ")}
                      >
                        {b.label}
                        {b.key === "2" && annualDiscount > 0 && (
                          <span
                            className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full"
                            style={{
                              color:      "#10b981",
                              background: "#10b98118",
                            }}
                          >
                            −{annualDiscount}%
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  )}
                </div>
                {category === "venue" ? (
                  /* ── Venue: single plan display (no selection) ── */
                  (() => {
                    const p         = visiblePlans[0];
                    if (!p) return null;
                    const rawPrice    = Number(p.offer_amount || p.amount || 0);
                    const price       = billing === "2" && rawPrice > 0 ? Math.round(rawPrice / 12) : rawPrice;
                    const annualPrice = billing === "2" ? rawPrice : rawPrice * 12;
                    const saving      = p.discount > 0 ? p.discount : 0;
                    
                    //New Updates
                    const percentage = Number(p.percentage || 0);
const isPercentagePlan = rawPrice === 0 && percentage > 0;
const isFreePlan = rawPrice === 0 && percentage === 0;
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="rounded-2xl bg-white dark:bg-gray-900 p-5 sm:p-6"
                        style={{ border: "1.5px solid " + tint.activeBorder, boxShadow: tint.activeGlow }}
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          {/* Left: plan name + stats */}
                          <div className="space-y-4 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ background: tint.hex }}
                              />
                              <p className="text-[15px] font-bold text-gray-900 dark:text-white">{p.plan_name}</p>
                              {p.badge && (
                                <span
                                  className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                                  style={{ background: tint.light, color: tint.hex, borderColor: tint.border }}
                                >
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-6 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-gray-400">{p.description}</span>
                                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200"> </span>
                              </div>
                             
                            </div>
                          </div>
                          {/* Right: price */}
                          <div className="text-end flex-shrink-0">
                            {rawPrice === 0  ? (
                              <span className="text-[30px] font-extrabold text-gray-900 dark:text-white">Free</span>
                            ) : billing === "2" ? (
                              <>
                                <div className="flex items-baseline gap-0.5 justify-end leading-none">
                                  <span className="text-[14px] font-semibold text-gray-400 mb-0.5">{currency_icon(country)}</span>
                                  <span className="text-[30px] font-extrabold text-gray-900 dark:text-white">
                                    {annualPrice.toLocaleString("en-IN")}
                                  </span>
                                  <span className="text-xs text-gray-400 ms-1">/year</span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">
                                  {currency_icon(country)}{price.toLocaleString("en-IN")}/month
                                  {saving > 0 && (
                                    <span className="ml-1.5 text-emerald-500 font-bold">· Save {saving}%</span>
                                  )}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="flex items-baseline gap-0.5 justify-end leading-none">
                                  <span className="text-[14px] font-semibold text-gray-400 mb-0.5">{currency_icon(country)}</span>
                                  <span className="text-[30px] font-extrabold text-gray-900 dark:text-white">
                                    {price.toLocaleString("en-IN")}
                                  </span>
                                  <span className="text-xs text-gray-400 ms-1">/month</span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">
                                  {currency_icon(country)}{annualPrice.toLocaleString("en-IN")} per year
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()
                ) : (
                  /* ── Other categories: plan selection grid ── */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {visiblePlans.map((p, i) => {
                      const rawPrice    = Number(p.offer_amount || p.amount || 0);
                      const price       = billing === "2" && rawPrice > 0 ? Math.round(rawPrice / 12) : rawPrice;
                      const annualPrice = billing === "2" ? rawPrice : rawPrice * 12;
                      const active      = selectedPlan === p.id;
                      const saving      = p.discount > 0 ? p.discount : 0;
                      const percentage       = Number(p.percentage || 0);
                      const isPercentagePlan = rawPrice === 0 && percentage > 0;
                      const isFreePlan       = rawPrice === 0 && percentage === 0;
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
                          <span
                            className="absolute top-4 end-4 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200"
                            style={active ? { background: tint.hex, borderColor: tint.hex } : { borderColor: "#d1d5db" }}
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
                          <p className={["text-[13px] font-bold mb-2.5", active ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"].join(" ")}>
                            {p.plan_name}
                          </p>
                          <div className="mb-4">
                           {isPercentagePlan ? (
  <>
    <div className="flex items-baseline gap-1">
      <span className="text-[26px] font-extrabold text-gray-900 dark:text-white">
        {percentage}%
      </span>
      <span className="text-xs text-gray-400">
        Commission
      </span>
    </div>
    <p className="text-[10px] text-gray-400 mt-1">
      Platform commission on every booking
    </p>
  </>
) : isFreePlan ? (
  <>
    <span className="text-[26px] font-extrabold text-gray-900 dark:text-white">
      Free
    </span>
    <p className="text-[10px] text-gray-400 mt-1">
      No subscription fee
    </p>
  </>
) : billing === "2" ? (
                              <>
                                <div className="flex items-baseline gap-0.5 leading-none">
                                  <span className="text-[13px] font-semibold text-gray-400 mb-0.5">{currency_icon(country)}</span>
                                  <span className="text-[26px] font-extrabold text-gray-900 dark:text-white">{annualPrice.toLocaleString("en-IN")}</span>
                                  <span className="text-xs text-gray-400 ms-0.5">/year</span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {currency_icon(country)}{price.toLocaleString("en-IN")}/month
                                  {saving > 0 && <span className="ml-1.5 text-emerald-500 font-bold">· Save {saving}%</span>}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="flex items-baseline gap-0.5 leading-none">
                                  <span className="text-[13px] font-semibold text-gray-400 mb-0.5">{currency_icon(country)}</span>
                                  <span className="text-[26px] font-extrabold text-gray-900 dark:text-white">{price.toLocaleString("en-IN")}</span>
                                  <span className="text-xs text-gray-400 ms-0.5">/month</span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">{currency_icon(country)}{annualPrice.toLocaleString("en-IN")} per year</p>
                              </>
                            )}
                          </div>
                          <div className="border-t border-gray-100 dark:border-gray-800/60 pt-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-gray-400">Commission</span>
                              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full" style={active ? { color: tint.hex, background: tint.light } : { color: "#6b7280", background: "rgba(107,114,128,0.08)" }}>
                                {p.fee}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-gray-400">Listings</span>
                              <span className={["text-[11px] font-bold", active ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"].join(" ")}>{p.listings}</span>
                            </div>
                            {p.highlight && <p className="text-[10px] text-gray-400 leading-relaxed pt-0.5">{p.highlight}</p>}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2.5 leading-relaxed">
                  All service charges are inclusive of 18% GST. Marketplace TCS will be deducted as per government mandates.
                </p>
              </motion.section>
              {/* Marketplace Fee & Settlement Logic — venue only */}
              {category === "venue" && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="rounded-2xl overflow-hidden border border-violet-200 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-950/30">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-violet-200/60 dark:border-violet-800/40">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-1">
                        Marketplace Fee &amp; Settlement Logic
                      </p>
                      <p className="text-[11px] text-violet-700/70 dark:text-violet-300/70 leading-relaxed">
                        Our system automatically calculates your earnings, deducts the platform fee + mandatory 1% GST-TCS, and settles the rest to your bank.
                      </p>
                    </div>
                    {/* Fee table */}
                    <div className="divide-y divide-violet-200/50 dark:divide-violet-800/30">
                      {[
                        { range: "₹0 – ₹49k",     fee: "5%" },
                        { range: "₹50k – ₹1L",    fee: "4%" },
                        { range: "₹1L+",           fee: "3%" },
                      ].map(({ range, fee }) => (
                        <div key={range} className="flex items-center justify-between px-5 py-3">
                          <span className="text-[12px] text-violet-800 dark:text-violet-200 font-medium">{range}</span>
                          <span className="text-[13px] font-bold text-violet-700 dark:text-violet-300">{fee}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}
              {/* Payment methods */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 me-0.5">Pay via</span>
                  {payConfig.methods.map((m) => (
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
                  {payConfig.secureMsg}
                </p>
              </motion.section>
            </div>
            {/* ── RIGHT: sticky summary (desktop) ───────────────── */}
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
      </div>
      {/* ════════════════════════════════════════════════════════════
          TERMS & CONDITIONS MODAL
      ════════════════════════════════════════════════════════════ */}
      <TermsModal
        open={showTermsModal}
        onClose={closeTerms}
        onAccept={acceptTerms}
        basePrice={basePrice}
        annualTotal={annualTotal} 
        maxVenue={maxVenue} 
      />
 
      {/* ════════════════════════════════════════════════════════════
          MOBILE FIXED BOTTOM BAR (hidden on desktop)
      ════════════════════════════════════════════════════════════ */}
      <MobilePayBar
        {...summaryProps}
        expanded={mobileExpanded}
        onToggleExpand={() => setMobileExpanded((v) => !v)}
      />
    </>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
//  Standard button hover/tap animation used across every primary CTA so the
//  whole page feels consistent (matches the plan-card motion values above).
// ─────────────────────────────────────────────────────────────────────────────
const CTA_HOVER = { y: -1, transition: { duration: 0.15 } };
const CTA_TAP   = { scale: 0.97 };

// Shared label/spinner swap so every CTA animates the same way when
// `activating` toggles — cross-fades + slides instead of an abrupt swap.
function CtaContent({ activating, label }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {activating ? (
        <motion.span
          key="processing"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="flex items-center justify-center gap-2"
        >
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing…
        </motion.span>
      ) : (
        <motion.span
          key="label"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="flex items-center justify-center gap-2"
        >
          <Lock size={14} strokeWidth={2.5} className="flex-shrink-0" />
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
//  Summary Panel (desktop right column)
// ─────────────────────────────────────────────────────────────────────────────
function SummaryPanel({
  plan, billing, basePrice, perMonth, gst, total, annualTotal,
  selectedModes, agreed, activating,
  isFreePlan, isCommissionPlan, isPaidPlan,
  quantity, onIncreaseQty, onDecreaseQty,
  onActivate, onPayLater, onOpenTerms, handleSubscribe, handlePrimaryCta, tint, fmt, payConfig, loading, countrys ,
  subtotal
}) {
  const isAnnual      = billing === "2";
  const isFree        = basePrice === 0;
  const annualGrand   = annualTotal;   // annualTotal is already GST-inclusive
  const billingPeriod = isAnnual && basePrice > 0 ? "Billed annually" : "Billed monthly";
  // Display price in plan row header
  // Annual: show yearly total big; Monthly: show monthly — both already scaled by quantity and GST-inclusive
  const displayPrice  = isFree ? "Free" : isAnnual ? formatPrice(annualGrand) + "/year" : formatPrice(total) + "/month";
  const displaySub    = isFree ? null : isAnnual
    ? formatPrice(perMonth) + "/month · billed annually"
    : billingPeriod;
  const gateway = payConfig?.gateway || "Razorpay";
  // CTA label: Free plan → "Activate Free", Commission-only plan → "Activate",
  // Paid plan → "Pay & Activate" (unchanged design/behaviour for paid plans)
  const ctaLabel = isFreePlan ? "Activate Free" : isCommissionPlan ? "Activate" : "Pay & Activate";
  
  return (
    <div className="space-y-3">
      {/* ── Main Card ────────────────────────────────────────────── */}
      <div
        className="rounded-2xl bg-white dark:bg-gray-900 overflow-hidden"
        style={{
          border: "1px solid " + tint.border,
          boxShadow: "0 2px 16px 0 " + tint.hex + "14",
        }}
      >
        {/* Gradient accent bar */}
        <div
          className="h-[3px] w-full"
          style={{ background: "linear-gradient(90deg, " + tint.hex + ", " + tint.hex + "40)" }}
        />
        <div className="px-5 pt-4 pb-5 space-y-4">
          {/* ── Plan header ── */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: tint.hex }}
                />
                <p className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight truncate">
                  {plan?.plan_name}
                </p>
              </div>
              {displaySub && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 ms-4 leading-tight">
                  {displaySub}
                </p>
              )}
            </div>
            <motion.p
              key={displayPrice}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[16px] font-extrabold flex-shrink-0 leading-tight"
              style={{ color: tint.hex }}
            >
              {displayPrice}
            </motion.p>
          </div>
          {/* ── Quantity stepper ── */}
          {!isFree && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Quantity</p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onDecreaseQty}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <span className="text-[15px] font-bold leading-none">−</span>
                </button>
                <motion.span
                  key={quantity}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="text-[13px] font-bold text-gray-900 dark:text-white w-5 text-center tabular-nums"
                >
                  {quantity}
                </motion.span>
                <button
                  type="button"
                  onClick={onIncreaseQty}
                  disabled={quantity >= 20}
                  aria-label="Increase quantity"
                  className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <span className="text-[15px] font-bold leading-none">+</span>
                </button>
              </div>
            </div>
          )}
          {/* ── Booking modes ── */}
          {selectedModes.size > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                Booking Modes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {BOOKING_MODES.filter((m) => selectedModes.has(m.key)).map((m) => (
                  <span
                    key={m.key}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      color:       m.color,
                      background:  m.color + "12",
                      border:      "1px solid " + m.color + "30",
                    }}
                  >
                    <m.Icon size={9} strokeWidth={2.5} />
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* ── Divider ── */}
          <div className="h-px bg-gray-100 dark:bg-gray-800" />
          {/* ── Price breakdown ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-gray-400 dark:text-gray-500">
                Subscription{isAnnual && !isFree ? " (annual)" : ""}{!isFree && quantity > 1 ? ` × ${quantity}` : ""}
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {isFree ? "Free" : formatPrice(subtotal)}
              </span>
            </div>
            {!isFree && (
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-400 dark:text-gray-500">GST (18%, included)</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">{formatPrice(gst)}</span>
              </div>
            )}
          </div>
          {/* ── Grand Total ── */}
          <div
            className="rounded-xl px-4 py-3.5"
            style={{ background: tint.activeBg, border: "1px solid " + tint.activeBorder }}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Grand Total
                </p>
                {isAnnual && annualGrand > 0 && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    incl. 18% GST · {formatPrice(perMonth)}/month
                  </p>
                )}
              </div>
              <div className="text-end">
                <motion.p
                  key={isFree ? "free" : isAnnual ? annualGrand : total}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[22px] font-extrabold leading-tight tracking-tight"
                  style={{ color: tint.hex }}
                >
                  {isFree ? "Free" : isAnnual ? formatPrice(annualGrand) : formatPrice(total)}
                </motion.p>
                {!isFree && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {isAnnual ? "per year" : "per month"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ── T&C checkbox ── */}
      <button
        type="button"
        onClick={onOpenTerms}
        className="flex items-start gap-2.5 w-full text-start group px-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg"
      >
        <span
          className={[
            "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
            agreed
              ? "bg-violet-600 border-violet-600 shadow-sm shadow-violet-300/40"
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
          and authorise venuebook.in split-settlements.
        </p>
      </button>
      {/* ── Primary CTA ──
          Merged into a single motion.button. India (id 2) routes through
          Razorpay (onActivate); everywhere else through Stripe
          (handleSubscribe) — resolved once as `handlePrimaryCta`. Uses the
          same hover/tap motion values as the plan cards above for a
          consistent, standard feel across the page. */}
      <motion.button
        type="button"
        disabled={!agreed || activating}
        onClick={handlePrimaryCta}
        whileHover={agreed && !activating ? CTA_HOVER : undefined}
        whileTap={agreed && !activating ? CTA_TAP : undefined}
        className={[
          "w-full flex items-center justify-center gap-2 py-4 rounded-xl",
          "text-[15px] font-bold text-white transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
          agreed && !activating
            ? "shadow-lg shadow-violet-200/50 dark:shadow-violet-950/40"
            : "opacity-40 cursor-not-allowed shadow-none",
        ].join(" ")}
        style={{
          background: agreed && !activating
            ? "linear-gradient(135deg, #a44bf3 0%, #499ce8 100%)"
            : "#9ca3af",
        }}
      >
        <CtaContent activating={activating} label={ctaLabel} />
      </motion.button>
      {/* ── Skip Payment ── */}
      <button
        type="button"
        onClick={onPayLater}
        disabled={!agreed || activating}
        className="w-full py-2.5 text-[13px] font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl"
      >
        Skip Payment · activate now, pay later
      </button>
      {/* ── Trust badges ── */}
      <div className="flex items-center justify-center gap-5 pt-0.5">
        {[
          { Icon: Shield,     text: "SSL secured"    },
          { Icon: Lock,       text: "No card stored" },
          { Icon: BadgeCheck, text: gateway          },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
            <Icon size={10} className="flex-shrink-0" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
//  Mobile Fixed Bottom Pay Bar
// ─────────────────────────────────────────────────────────────────────────────
function MobilePayBar({
  plan, billing, basePrice, perMonth, gst, total, annualTotal,
  selectedModes, agreed, activating,
  isFreePlan, isCommissionPlan, isPaidPlan,
  quantity, onIncreaseQty, onDecreaseQty,
  onActivate, onPayLater, onOpenTerms, handleSubscribe, handlePrimaryCta, tint, fmt, payConfig, countrys, subtotal,
  expanded, onToggleExpand
}) {
  const isAnnual    = billing === "2";
  const isFree      = basePrice === 0;
  const annualGrand = annualTotal;   // annualTotal is already GST-inclusive
  const displayAmt  = isFree ? "Free" : isAnnual ? formatPrice(annualGrand) : formatPrice(total);
  const period      = isFree ? "" : isAnnual ? "/year" : "/month";
  // CTA label: Free plan → "Activate Free", Commission-only plan → "Activate",
  // Paid plan → "Pay & Activate" (unchanged design/behaviour for paid plans)
  const ctaLabel = isFreePlan ? "Activate Free" : isCommissionPlan ? "Activate" : "Pay & Activate";
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40">
      {/* Backdrop */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="mob-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onToggleExpand}
          />
        )}
      </AnimatePresence>
      <div className="relative bg-white dark:bg-gray-950 border-t border-gray-200/70 dark:border-gray-800/60 shadow-2xl shadow-black/10">
        {/* ── Expandable summary ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="mob-summary"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pt-5 pb-2 space-y-4 max-h-[55vh] overflow-y-auto">
                {/* Quantity stepper */}
                {!isFree && (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Quantity</p>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={onDecreaseQty}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none"
                      >
                        <span className="text-[15px] font-bold leading-none">−</span>
                      </button>
                      <span className="text-[13px] font-bold text-gray-900 dark:text-white w-5 text-center tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={onIncreaseQty}
                        disabled={quantity >= 20}
                        aria-label="Increase quantity"
                        className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none"
                      >
                        <span className="text-[15px] font-bold leading-none">+</span>
                      </button>
                    </div>
                  </div>
                )}
                {/* Booking modes */}
                {selectedModes.size > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                      Booking Modes
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {BOOKING_MODES.filter((m) => selectedModes.has(m.key)).map((m) => (
                        <span
                          key={m.key}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: m.color, background: m.color + "12", border: "1px solid " + m.color + "30" }}
                        >
                          <m.Icon size={9} strokeWidth={2.5} />
                          {m.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Price breakdown */}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-gray-400">Subscription{isAnnual && !isFree ? " (annual)" : ""}{!isFree && quantity > 1 ? ` × ${quantity}` : ""}</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      {isFree ? "Free" : formatPrice(subtotal)}
                    </span>
                  </div>
                  {!isFree && (
                    <div className="flex justify-between text-[12px]">
                      <span className="text-gray-400">GST (18%, included)</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{formatPrice(gst)}</span>
                    </div>
                  )}
                </div>
                {/* Grand total row */}
                <div
                  className="rounded-xl px-4 py-3"
                  style={{ background: tint.activeBg, border: "1px solid " + tint.activeBorder }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Grand Total</p>
                      {isAnnual && !isFree && (
                        <p className="text-[10px] text-gray-400 mt-0.5">incl. GST · {formatPrice(perMonth)}/month</p>
                      )}
                    </div>
                    <div className="text-end">
                      <p className="text-[20px] font-extrabold leading-tight" style={{ color: tint.hex }}>
                        {displayAmt}
                      </p>
                      {!isFree && (
                        <p className="text-[10px] text-gray-400">{isAnnual ? "per year" : "per month"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* ── Fixed bottom actions ── */}
        <div
          className="px-5 pt-3.5"
          style={{ paddingBottom: "max(1.125rem, env(safe-area-inset-bottom))" }}
        >
          {/* Summary row + expand toggle */}
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                {plan?.plan_name} · {billing === "2" ? "Annual" : "Monthly"}
              </p>
              <p className="text-[18px] font-extrabold text-gray-900 dark:text-white leading-tight">
                {displayAmt}
                {!isFree && <span className="text-[11px] font-normal text-gray-400 ms-1">{period}</span>}
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleExpand}
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all flex-shrink-0 focus:outline-none"
              style={{
                color:      tint.hex,
                background: tint.light,
                border:     "1px solid " + tint.border,
              }}
            >
              {expanded ? "Hide" : "Details"}
              <motion.span
                animate={{ rotate: expanded ? -90 : 90 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex"
              >
                <ChevronRight size={11} strokeWidth={2.5} />
              </motion.span>
            </button>
          </div>
          {/* T&C */}
          <button
            type="button"
            onClick={onOpenTerms}
            className="flex items-center gap-2 w-full mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg"
          >
            <span
              className={[
                "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all",
                agreed
                  ? "bg-violet-600 border-violet-600"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
              ].join(" ")}
            >
              {agreed && <Check size={8} strokeWidth={3.5} className="text-white" />}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 text-start">
              {agreed ? "Terms accepted ✓" : "I accept the terms & conditions"}
            </span>
          </button>
          {/* CTAs */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onPayLater}
              disabled={!agreed || activating}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-[13px] font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none active:scale-[0.97]"
            >
              Skip Payment
            </button>
            <motion.button
              type="button"
              disabled={!agreed || activating}
              onClick={handlePrimaryCta}
              whileHover={agreed && !activating ? CTA_HOVER : undefined}
              whileTap={agreed && !activating ? CTA_TAP : undefined}
              className={[
                "flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl",
                "text-[14px] font-bold text-white transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                agreed && !activating
                  ? "shadow-lg shadow-violet-200/50"
                  : "opacity-40 cursor-not-allowed",
              ].join(" ")}
              style={{
                background: agreed && !activating
                  ? "linear-gradient(135deg, #a44bf3 0%, #499ce8 100%)"
                  : "#9ca3af",
              }}
            >
              <CtaContent activating={activating} label={ctaLabel} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
//  Terms & Conditions Modal
// ─────────────────────────────────────────────────────────────────────────────
function TermsModal({ open, onClose, onAccept , basePrice , annualTotal, maxVenue}) {
  const scrollRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  // Lock body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  // Track scroll position for fade shadows
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrolled(el.scrollTop > 8);
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 8);
  }, []);
  
const replaceValue = (value) => {
  const data = {
    child_count: maxVenue,//parentData?.child_count ?? 0,
    price: maxVenue==0 ? basePrice : (basePrice/maxVenue),//parentData?.price ?? 0,
    recurring_payment: basePrice,//parentData?.recurring_payment ?? "",
    total_price: basePrice,//parentData?.total_price ?? 0,
  };
  return String(value || "").replace(/\{\{(.*?)\}\}/g, (_, key) => data[key.trim()] ?? "");
};
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
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
          {/* Modal panel — 760px wide, 85vh tall */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[61] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: "min(700px, calc(100vw - 2rem))", height: "min(80vh, 720px)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-modal-title"
          >
            <div className="flex flex-col h-full rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-2xl shadow-black/15 dark:shadow-black/50 overflow-hidden">
              {/* ── Header ── */}
              <div className="flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800" style={{ height: "64px" }}>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center flex-shrink-0">
                    <FileText size={13} className="text-violet-600 dark:text-violet-400" />
                  </span>
                  <div>
                    <h2 id="terms-modal-title" className="text-[15px] font-semibold text-gray-900 dark:text-white leading-none">
                      Terms &amp; Conditions
                    </h2>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none">
                      {termsData.company} · v{termsData.version} · Effective {termsData.effectiveDate}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                >
                  <X size={14} />
                </button>
              </div>
              {/* ── Scrollable body ── */}
              <div className="relative flex-1 min-h-0">
                {/* Scroll shadows */}
                <div
                  className="pointer-events-none absolute top-0 inset-x-0 h-5 z-10 transition-opacity duration-200"
                  style={{ background: "linear-gradient(to bottom, white, transparent)", opacity: scrolled ? 1 : 0 }}
                />
                <div
                  className="pointer-events-none absolute bottom-0 inset-x-0 h-6 z-10 transition-opacity duration-200"
                  style={{ background: "linear-gradient(to top, white, transparent)", opacity: atBottom ? 0 : 1 }}
                />
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="h-full overflow-y-auto px-6 py-5"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
                >
                  {termsData.sections.map((section, si) => (
                    <div key={section.number} style={{ marginTop: si === 0 ? 0 : "22px" }}>
                      {/* Section divider */}
                      {si > 0 && (
                        <div className="h-px bg-gray-100 dark:bg-gray-800" style={{ marginBottom: "20px" }} />
                      )}
                      {/* Section heading */}
                      <h3
                        className="font-semibold"
                        style={{ fontSize: "13px", color: "#7c3aed", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.04em" }}
                      >
                        {section.number}. {section.title}
                      </h3>
                      {/* Clauses */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {section.clauses.map((clause) => (
                          <div key={clause.id}>
                            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                              <span
                                className="flex-shrink-0 font-semibold tabular-nums"
                                style={{ color: "#7c3aed", width: "36px", minWidth: "36px", fontSize: "12px", lineHeight: "1.7", paddingTop: "1px" }}
                              >
                                {clause.id}
                              </span>
                              <p
                                className="flex-1 m-0 text-gray-600 dark:text-gray-400"
                                style={{ fontSize: "13.5px", lineHeight: "1.7" }}
                              >
                                {clause.text}
                              </p>
                            </div>
                            {/* Tables */}
                            {clause.tables?.map((table) => (
                              <div
                                key={table.title}
                                className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                                style={{ marginTop: "10px", marginLeft: "46px" }}
                              >
                                <div className="px-3 py-2" style={{ background: "#ede9fe" }}>
                                  <p className="text-[10px] font-bold uppercase tracking-wider m-0" style={{ color: "#5b21b6" }}>
                                    {table.title}
                                  </p>
                                </div>
                                {table.rows.map((row, ri) => {
                                  const isTotal = row.label.toLowerCase().startsWith("total");
                                  return (
                                    <div
                                      key={ri}
                                      className={[
                                        "flex items-center justify-between px-3",
                                        ri < table.rows.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : "",
                                        isTotal ? "bg-violet-50 dark:bg-violet-950/20" : "",
                                      ].join(" ")}
                                      style={{ paddingTop: "9px", paddingBottom: "9px", gap: "12px" }}
                                    >
                                      <span
                                        className={isTotal ? "font-semibold" : "text-gray-500 dark:text-gray-400"}
                                        style={{ fontSize: "12px", ...(isTotal ? { color: "#5b21b6" } : {}) }}
                                      >
                                        {row.label}
                                      </span>
                                      {row.value && (
                                        <span
                                          className={isTotal ? "font-bold" : "font-medium text-gray-700 dark:text-gray-200"}
                                          style={{ fontSize: "12px", flexShrink: 0, ...(isTotal ? { color: "#5b21b6" } : {}) }}
                                        >
                                          {replaceValue(row.value)}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* ── Footer ── */}
              <div
                className="flex-shrink-0 flex items-center gap-3 px-6 border-t border-gray-100 dark:border-gray-800"
                style={{ paddingTop: "14px", paddingBottom: "14px" }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300 transition-all focus:outline-none"
                  style={{ fontSize: "13.5px", height: "44px" }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={onAccept}
                  className="flex-1 rounded-xl font-bold text-white hover:opacity-90 active:scale-[0.98] transition-all focus:outline-none shadow-md shadow-violet-200/40"
                  style={{ fontSize: "13.5px", height: "44px", background: "linear-gradient(135deg, #a44bf3, #499ce8)" }}
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