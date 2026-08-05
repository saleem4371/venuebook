"use client";

import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { loadVenues } from "@/services/venue_details.service";
import { Utensils } from "lucide-react";
import PremiumCalendar from "../../components/listing/PremiumCalendar";
import lightLogo from "@/assets/logo.svg";
import darkLogo  from "@/assets/logo.png";

import { verify_checkout_token } from "@/services/venues.service";
import { loadPackage , package_booking } from '@/services/package.service'

// ─── Lock body scroll while a modal is mounted ───────────────────────────────
// Counter-based: only lock on first open, only unlock when last modal closes.
// This prevents the race where two modals unmount in the same render and the
// "restore prev" order is non-deterministic.
let _lockCount = 0;
const _modalStack = [];
function useLockScroll(onEsc) {
  useEffect(() => {
    _lockCount++;
    if (_lockCount === 1) document.body.style.overflow = "hidden";
    const entry = { onEsc };
    _modalStack.push(entry);
    const onKey = e => {
      if (e.key === "Escape" && _modalStack[_modalStack.length - 1] === entry) {
        entry.onEsc?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      _lockCount--;
      if (_lockCount === 0) document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      const i = _modalStack.indexOf(entry);
      if (i > -1) _modalStack.splice(i, 1);
    };
  }, []);
}

// ─── Mock Data (fallback only — used if the API returns nothing) ────────────
const MOCK_CATEGORIES = [
  { id: 1, name: "Starters & Soups" },
  { id: 2, name: "Main Course" },
  { id: 3, name: "Breads & Rice" },
  { id: 4, name: "Desserts" },
  { id: 5, name: "Beverages" },
];
const MOCK_ITEMS = [
  { id: 101, category_id: 1, category_name: "Starters & Soups", item_name: "Veg Spring Rolls", food_type: 1 },
  { id: 102, category_id: 1, category_name: "Starters & Soups", item_name: "Paneer Tikka", food_type: 1 },
  { id: 103, category_id: 1, category_name: "Starters & Soups", item_name: "Hara Bhara Kebab", food_type: 1 },
  { id: 104, category_id: 1, category_name: "Starters & Soups", item_name: "Tomato Soup", food_type: 1 },
  { id: 105, category_id: 1, category_name: "Starters & Soups", item_name: "Chicken Tikka", food_type: 2 },
  { id: 106, category_id: 1, category_name: "Starters & Soups", item_name: "Seekh Kebab", food_type: 2 },
  { id: 107, category_id: 1, category_name: "Starters & Soups", item_name: "Chicken Soup", food_type: 2 },
  { id: 201, category_id: 2, category_name: "Main Course", item_name: "Paneer Butter Masala", food_type: 1 },
  { id: 202, category_id: 2, category_name: "Main Course", item_name: "Dal Makhani", food_type: 1 },
  { id: 203, category_id: 2, category_name: "Main Course", item_name: "Veg Biryani", food_type: 1 },
  { id: 204, category_id: 2, category_name: "Main Course", item_name: "Mix Veg Curry", food_type: 1 },
  { id: 205, category_id: 2, category_name: "Main Course", item_name: "Kadai Paneer", food_type: 1 },
  { id: 206, category_id: 2, category_name: "Main Course", item_name: "Chicken Biryani", food_type: 2 },
  { id: 207, category_id: 2, category_name: "Main Course", item_name: "Butter Chicken", food_type: 2 },
  { id: 208, category_id: 2, category_name: "Main Course", item_name: "Mutton Rogan Josh", food_type: 2 },
  { id: 301, category_id: 3, category_name: "Breads & Rice", item_name: "Butter Naan", food_type: 1 },
  { id: 302, category_id: 3, category_name: "Breads & Rice", item_name: "Tandoori Roti", food_type: 1 },
  { id: 303, category_id: 3, category_name: "Breads & Rice", item_name: "Laccha Paratha", food_type: 1 },
  { id: 304, category_id: 3, category_name: "Breads & Rice", item_name: "Steamed Rice", food_type: 1 },
  { id: 305, category_id: 3, category_name: "Breads & Rice", item_name: "Jeera Rice", food_type: 1 },
  { id: 401, category_id: 4, category_name: "Desserts", item_name: "Gulab Jamun", food_type: 1 },
  { id: 402, category_id: 4, category_name: "Desserts", item_name: "Rasgulla", food_type: 1 },
  { id: 403, category_id: 4, category_name: "Desserts", item_name: "Kheer", food_type: 1 },
  { id: 404, category_id: 4, category_name: "Desserts", item_name: "Ice Cream (2 flavours)", food_type: 1 },
  { id: 405, category_id: 4, category_name: "Desserts", item_name: "Fruit Custard", food_type: 1 },
  { id: 501, category_id: 5, category_name: "Beverages", item_name: "Welcome Drink (Mocktail)", food_type: 1 },
  { id: 502, category_id: 5, category_name: "Beverages", item_name: "Fresh Lime Soda", food_type: 1 },
  { id: 503, category_id: 5, category_name: "Beverages", item_name: "Masala Chai", food_type: 1 },
  { id: 504, category_id: 5, category_name: "Beverages", item_name: "Filter Coffee", food_type: 1 },
  { id: 505, category_id: 5, category_name: "Beverages", item_name: "Soft Drinks Assorted", food_type: 1 },
];
const MOCK_PACKAGES = [
  { id: "pkg_silver",   package_name: "Silver Banquet",  package_amount: 850,  package_food_type: 1, is_popular: false, max_items_per_category: 2, categories: [{ id: 1, name: "Starters & Soups" }, { id: 3, name: "Breads & Rice" }, { id: 4, name: "Desserts" }] },
  { id: "pkg_gold",     package_name: "Gold Feast",      package_amount: 1200, package_food_type: 1, is_popular: true,  max_items_per_category: 3, categories: [{ id: 1, name: "Starters & Soups" }, { id: 2, name: "Main Course" }, { id: 3, name: "Breads & Rice" }, { id: 4, name: "Desserts" }] },
  { id: "pkg_platinum", package_name: "Platinum Grand",  package_amount: 1800, package_food_type: 1, is_popular: false, max_items_per_category: 4, categories: MOCK_CATEGORIES },
  { id: "pkg_nonveg",   package_name: "Non-Veg Special", package_amount: 1500, package_food_type: 2, is_popular: false, max_items_per_category: 3, categories: [{ id: 1, name: "Starters & Soups" }, { id: 2, name: "Main Course" }, { id: 3, name: "Breads & Rice" }, { id: 4, name: "Desserts" }, { id: 5, name: "Beverages" }] },
  { id: "pkg_budget",   package_name: "Budget Bliss",    package_amount: 650,  package_food_type: 1, is_popular: false, max_items_per_category: 2, categories: [{ id: 2, name: "Main Course" }, { id: 3, name: "Breads & Rice" }] },
];
function submitMockEnquiry(p) { return new Promise(r => setTimeout(() => r({ success: true }), 1200)); }

// ─── Constants (unchanged) ────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Guests & Menu", short: "Menu"    },
  { id: 2, label: "Requirements",  short: "Reqs"    },
  { id: 3, label: "Contact Info",  short: "Contact" },
  { id: 4, label: "Review",        short: "Review"  },
];
const DIETARY_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian" }, { id: "vegan", label: "Vegan" },
  { id: "glutenFree", label: "Gluten-Free" }, { id: "dairyFree", label: "Dairy-Free" },
  { id: "halal", label: "Halal" }, { id: "kosher", label: "Kosher" },
];
const ALLERGY_OPTIONS = [
  { id: "nuts", label: "Nuts" }, { id: "shellfish", label: "Shellfish" },
  { id: "dairy", label: "Dairy" }, { id: "eggs", label: "Eggs" },
  { id: "soy", label: "Soy" }, { id: "wheat", label: "Wheat" },
  { id: "fish", label: "Fish" }, { id: "other", label: "Other" },
];
const SERVING_PREFS = ["Buffet", "Plated", "Family Style", "Stations"];
const SHIFT_OPTIONS      = ["Morning", "Afternoon", "Evening", "Night"];
const EVENT_TYPE_OPTIONS = ["Wedding", "Reception", "Roce", "Engagement", "Birthday", "Corporate", "Baby Shower", "Other"];
const MINIMUM_PAX = 50;
const FOOD_TAX = 0.05;
const ADDON_TAX = 0.18;
const DRAFT_KEY = "paxBookingDraft";

// ─── Helpers (unchanged) ──────────────────────────────────────────────────────
function fmt(n) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0); }
function fmtDate(d) { if (!d) return ""; try { return new Date(d).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); } catch { return d; } }
function genRef() { return "VB-PAX-" + Math.random().toString(36).substring(2, 8).toUpperCase(); }

// ─── Design Tokens ────────────────────────────────────────────────────────────
const P   = "var(--pax-p)";
const PH  = "var(--pax-ph)";
const PL  = "var(--pax-pl)";
const PLL = "var(--pax-pll)";
const PR  = "var(--pax-pr)";

// ─── Tabler Icons (inline SVG) ────────────────────────────────────────────────
const Ico = ({ d, d2, d3, circle, size = 20, color = "currentColor", sw = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    {circle && <circle cx={circle[0]} cy={circle[1]} r={circle[2]}/>}
    <path d={d}/>
    {d2 && <path d={d2}/>}
    {d3 && <path d={d3}/>}
  </svg>
);

const ICheck     = (p = {}) => <Ico {...p} d="M5 12l5 5l10-10"/>;
const IChevL     = (p = {}) => <Ico {...p} d="M15 6l-6 6l6 6"/>;
const IChevR     = (p = {}) => <Ico {...p} d="M9 6l6 6l-6 6"/>;
const IChevD     = ({ rot, ...p }) => <span style={{ display:"inline-flex", transition:"transform 0.25s", transform: rot ? "rotate(180deg)" : "none" }}><Ico {...p} d="M6 9l6 6l6-6"/></span>;
const IClose     = (p = {}) => <Ico {...p} d="M18 6L6 18M6 6l12 12"/>;
const ISearch    = (p = {}) => <Ico {...p} circle={[10,10,7]} d="M21 21l-6-6"/>;
const IInfo      = (p = {}) => <Ico {...p} circle={[12,12,9]} d="M12 8h.01M11 12h1v4h1"/>;
const IWarn      = (p = {}) => <Ico {...p} d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" d2="M12 9v4" d3="M12 17h.01"/>;
const IUtensils  = ({ size = 20, color = "currentColor", sw = 1.75 }) => <Utensils size={size} color={color} strokeWidth={sw}/>;
const ICalendar  = (p = {}) => <Ico {...p} d="M4 7a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7zM16 3v4M8 3v4M4 11h16M11 15h1M12 15v3"/>;
const IUsers     = (p = {}) => <Ico {...p} circle={[9,7,4]} d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85"/>;
const IPin       = (p = {}) => <Ico {...p} circle={[12,11,3]} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>;
const ICheckCirc = (p = {}) => <Ico {...p} circle={[12,12,9]} d="M9 12l2 2l4-4"/>;
const ITag       = (p = {}) => <Ico {...p} d="M7.5 7.5m-1 0a1 1 0 102 0 1 1 0 10-2 0M3 6a3 3 0 013-3h3.586a1 1 0 01.707.293l7.414 7.414a2 2 0 010 2.828l-4.586 4.586a2 2 0 01-2.828 0L3.293 10.707A1 1 0 013 10V6z"/>;
const IReceipt   = (p = {}) => <Ico {...p} d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16l-3-2l-2 2l-2-2l-2 2l-2-2l-3 2zM9 7h6M9 11h6M9 15h4"/>;
const IArrowR    = (p = {}) => <Ico {...p} d="M5 12h14M13 18l6-6M13 6l6 6"/>;
const IPlus      = (p = {}) => <Ico {...p} d="M12 5v14M5 12h14"/>;
const IMinus     = (p = {}) => <Ico {...p} d="M5 12h14"/>;
const IStar      = (p = {}) => <Ico {...p} d="M12 17.75l-6.172 3.245l1.179-6.873l-5-4.867l6.9-1l3.086-6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>;
const ILeaf      = (p = {}) => <Ico {...p} d="M5 21c.5-4.5 2.5-8 7-10M9 18c6.218 0 10.5-3.288 11-12v-2h-4.014c-9 0-11.986 4-12 9c0 1 0 3 2 5h3z"/>;
const IMail      = (p = {}) => <Ico {...p} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 7l9 6l9-6"/>;
const IPhone     = (p = {}) => <Ico {...p} d="M5 4h4l2 5l-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 014 6a2 2 0 012-2"/>;
const IBuild     = (p = {}) => <Ico {...p} d="M3 21h18M5 21V7l7-4l7 4v14M9 9v.01M9 12v.01M9 15v.01M15 9v.01M15 12v.01M15 15v.01M12 21v-4a1 1 0 011-1h2a1 1 0 011 1v4"/>;
const IFile      = (p = {}) => <Ico {...p} d="M14 3v4a1 1 0 001 1h4M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2zM9 9h1M9 13h6M9 17h6"/>;
const IClock     = (p = {}) => <Ico {...p} circle={[12,12,9]} d="M12 7v5l3 3"/>;

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  :root {
    --pax-bg:#fff; --pax-card:#fff; --pax-t1:#111827; --pax-t2:#374151;
    --pax-t3:#6B7280; --pax-t4:#9CA3AF; --pax-brd:#dddddd; --pax-brd2:#F0EFFE;
    --pax-brd3:#dddddd; --pax-muted:#F9FAFB; --pax-muted2:#F3F4F6;
    --pax-p:#7C3AED; --pax-ph:#6D28D9; --pax-pl:#EDE9FE; --pax-pll:#F5F3FF;
    --pax-pr:rgba(124,58,237,0.12); --pax-header:rgba(255,255,255,0.95);
  }
  .dark {
    --pax-bg:#0D0D1A; --pax-card:#161625; --pax-t1:#F9FAFB; --pax-t2:#E5E7EB;
    --pax-t3:#9CA3AF; --pax-t4:#6B7280; --pax-brd:#374151; --pax-brd2:#2E1065;
    --pax-brd3:#1F2937; --pax-muted:#111827; --pax-muted2:#1F2937;
    --pax-p:#8B5CF6; --pax-ph:#7C3AED; --pax-pl:#2E1065; --pax-pll:#1E1B4B;
    --pax-pr:rgba(139,92,246,0.2); --pax-header:rgba(13,13,26,0.95);
  }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
  @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
  @keyframes shimmer { from { background-position:-200% 0; } to { background-position:200% 0; } }
  @keyframes popIn   { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }

  html, body { background: var(--pax-bg); color: var(--pax-t1); }
  *,*::before,*::after { box-sizing:border-box; }
  input,textarea,select,button { font-family:inherit; }
  input:focus,textarea:focus,select:focus { outline:none; }
  button:focus-visible { outline:2px solid var(--pax-p); outline-offset:2px; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { display:none; }
  input[type=number] { -moz-appearance:textfield; }
  input[type=checkbox],input[type=radio] { accent-color:var(--pax-p); }

  .pax-card  { animation: fadeUp 0.26s cubic-bezier(0.16,1,0.3,1); }
  .pax-modal { animation: scaleIn 0.22s cubic-bezier(0.16,1,0.3,1); }
  .pax-sheet { animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1); }
  .pax-pop   { animation: popIn 0.28s cubic-bezier(0.16,1,0.3,1); }

  .pkg-card { transition: border-color 0.15s; }
  .pkg-card:hover { border-color: var(--pax-t2) !important; }

  .pax-btn-primary { transition: background 0.15s, box-shadow 0.15s, transform 0.1s; }
  .pax-btn-primary:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(124,58,237,0.38); transform: translateY(-1px); }
  .pax-btn-primary:active:not(:disabled) { transform: translateY(0); }

  .pax-counter-btn { transition: transform 0.1s, background 0.15s, border-color 0.15s; }
  .pax-counter-btn:active:not(:disabled) { transform: scale(0.9); }

  .pax-chip { transition: border-color 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s; }
  .pax-chip:hover { box-shadow: 0 0 0 1px var(--pax-p); }

  .pax-input:focus { border-color: var(--pax-p) !important; box-shadow: 0 0 0 3px var(--pax-pr) !important; }
  .pax-input { transition: border-color 0.15s, box-shadow 0.15s; }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--pax-brd); border-radius:3px; }
`;

function normalizeCatalog(payload) {
  const rawCategories = Array.isArray(payload?.category) ? payload.category : [];
  const rawItemGroups = Array.isArray(payload?.items) ? payload.items : [];
  const rawPackages   = Array.isArray(payload?.package) ? payload.package : [];

  const categories = rawCategories
    .filter(c => c?.cat_publish === 1 && c?.item_category && c.item_category.trim())
    .map(c => ({ id: c.id, name: c.item_category }));

  const publishedIds = new Set(categories.map(c => c.id));
  const categoryById = new Map(categories.map(c => [c.id, c])); // NEW

  const items = [];
  const foodTypeById = new Map();
  rawItemGroups.forEach(group => {
    if (!publishedIds.has(group?.id)) return;
    (group.package_item || []).forEach(pi => {
      const foodType = pi.food_pre === 2 ? 2 : 1;
      items.push({
        id: pi.id,
        category_id: pi.cat_id ?? group.id,
        category_name: group.item_category,
        item_name: pi.item_name,
        price: Number(pi.item_price) || 0,
        image: pi.image || "",
        food_type: foodType,
      });
      foodTypeById.set(pi.id, foodType);
    });
  });

  const packages = rawPackages
    .filter(pkg => pkg?.package_status !== 0)
    .map(pkg => {
      const allowedItemIds = (pkg.package_items || []).map(Number);
      const categoryRequirements = (pkg.category_items || [])
        .filter(ci => ci?.category_id != null)
        .map(ci => ({ id: ci.category_id, count: Math.max(1, Number(ci.count) || 1) }));

      // Link the package to actual category objects via category_items —
      // this is what PackageModal needs to only show relevant courses.
      const pkgCategories = categoryRequirements
        .map(cr => categoryById.get(cr.id))
        .filter(Boolean);

      const foodTypesInPkg = new Set(allowedItemIds.map(id => foodTypeById.get(id)).filter(Boolean));
      const packageFoodType = foodTypesInPkg.size === 1 ? [...foodTypesInPkg][0] : undefined;

      return {
        id: pkg.id,
        package_name: pkg.name,
        package_amount: Number(pkg.price) || 0,
        package_food_type: packageFoodType,
        allowed_item_ids: allowedItemIds,
        category_requirements: categoryRequirements,
        categories: pkgCategories,        // <-- fixes the modal's category filter
        is_popular: !!pkg.is_popular,
      };
    });

  return { categories, items, packages };
}


// ─── ProgressSteps ────────────────────────────────────────────────────────────
function ProgressSteps({ current }) {
  return (
    <nav aria-label="Booking progress" className="flex items-center justify-center">
      {STEPS.map((step, i) => {
        const done   = current > step.id;
        const active = current === step.id;
        return (
          <Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              {/* Circle */}
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all duration-300"
                style={{
                  background: active ? P : done ? "var(--pax-muted2)" : "var(--pax-muted2)",
                  color: active ? "#fff" : "var(--pax-t4)",
                  border: active ? "none" : `2px solid ${done ? "var(--pax-brd)" : "var(--pax-brd)"}`,
                }}
                aria-label={`Step ${step.id}: ${step.label}${done ? " (completed)" : active ? " (current)" : ""}`}
              >
                {done
                  ? <ICheck size={13} color="var(--pax-t3)" sw={2.5}/>
                  : <span className="text-[0.75rem] font-semibold leading-none">{step.id}</span>
                }
              </div>
              {/* Label */}
              <span
                className="whitespace-nowrap text-[0.6375rem] tracking-wide transition-colors duration-300 hidden sm:block"
                style={{ color: active ? P : "var(--pax-t4)", fontWeight: active ? 600 : 400 }}
              >
                {step.label}
              </span>
              <span
                className="whitespace-nowrap text-[0.6375rem] tracking-wide transition-colors duration-300 sm:hidden"
                style={{ color: active ? P : "var(--pax-t4)", fontWeight: active ? 600 : 400 }}
              >
                {step.short}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 mx-2 sm:mx-3 transition-all duration-300"
                style={{ height: "1px", marginBottom: "22px", background: "var(--pax-brd3)" }}
              />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
// Lightweight card — replaces the heavy SectionCard.
// Use `bare` for no card shell (plain grouping), `flush` for no padding.
function Section({ title, subtitle, children, className = "", bare = false }) {
  if (bare) {
    return (
      <div className={className}>
        {(title || subtitle) && (
          <div className="mb-5">
            {title    && <h3 className="font-bold text-[1.0625rem] m-0 leading-tight" style={{ color:"var(--pax-t1)" }}>{title}</h3>}
            {subtitle && <p  className="text-sm m-0 mt-1 leading-relaxed" style={{ color:"var(--pax-t3)" }}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    );
  }
  return (
    <div className={`rounded-2xl p-6 ${className}`} style={{ background:"var(--pax-card)", border:"1px solid var(--pax-brd3)" }}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title    && <h3 className="font-bold text-[1.0625rem] m-0 leading-tight" style={{ color:"var(--pax-t1)" }}>{title}</h3>}
          {subtitle && <p  className="text-sm m-0 mt-1 leading-relaxed" style={{ color:"var(--pax-t3)" }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── FieldWrap ────────────────────────────────────────────────────────────────
function FieldWrap({ label, required, error, hint, children }) {
  return (
    <div>
      {label && (
        <label className="block text-[0.8125rem] font-semibold mb-1.5 tracking-[0.01em]" style={{ color:"var(--pax-t2)" }}>
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 mt-1.5 text-[0.8125rem] text-red-600 m-0">
          <IWarn size={13} color="#DC2626" sw={2}/> {error}
        </p>
      )}
      {hint && !error && <p className="text-[0.8125rem] mt-1.5 m-0 leading-relaxed" style={{ color:"var(--pax-t4)" }}>{hint}</p>}
    </div>
  );
}

// ─── PaxInput ─────────────────────────────────────────────────────────────────
function PaxInput({ label, required, error, hint, icon, ...props }) {
  return (
    <FieldWrap label={label} required={required} error={error} hint={hint}>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex pointer-events-none" style={{ color:"var(--pax-t4)" }}>
            {icon}
          </span>
        )}
        <input
          {...props}
          className="pax-input w-full h-12 rounded-xl text-[0.9375rem] border-[1.5px] focus:outline-none"
          style={{
            paddingLeft: icon ? "42px" : "14px",
            paddingRight: "14px",
            borderColor: error ? "#FCA5A5" : "var(--pax-brd)",
            color: "var(--pax-t1)",
            background: "var(--pax-card)",
            fontFamily: "inherit",
            ...props.style,
          }}
        />
      </div>
    </FieldWrap>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────
function BtnPrimary({ children, disabled, loading, className = "", ...props }) {
  const dis = disabled || loading;
  return (
    <button
      {...props}
      disabled={dis}
      className={`pax-btn-primary inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl border-0 font-semibold text-[0.9375rem] tracking-[0.01em] whitespace-nowrap ${dis ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      style={{
        background: dis ? "var(--pax-p)" : `linear-gradient(135deg, var(--pax-p), var(--pax-ph))`,
        color: "#fff",
        boxShadow: "none",
        ...(props.style || {}),
      }}
    >
      {loading && (
        <span className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white/30 border-t-white" style={{ animation:"spin 0.7s linear infinite" }}/>
      )}
      {children}
    </button>
  );
}

function BtnSecondary({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-5 h-12 rounded-xl font-medium text-[0.9375rem] whitespace-nowrap cursor-pointer border-[1.5px] transition-colors hover:bg-[var(--pax-muted)] hover:border-[var(--pax-t4)] ${className}`}
      style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd)", color:"var(--pax-t2)", ...(props.style || {}) }}
    >
      {children}
    </button>
  );
}

function BtnGhost({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 px-3 h-10 rounded-xl border-0 font-medium text-[0.9375rem] cursor-pointer transition-colors hover:text-[var(--pax-t2)] hover:bg-[var(--pax-muted2)] ${className}`}
      style={{ background:"transparent", color:"var(--pax-t3)", ...(props.style || {}) }}
    >
      {children}
    </button>
  );
}

function Divider({ className = "" }) {
  return <div className={`h-px ${className}`} style={{ background:"var(--pax-brd3)" }}/>;
}

// ─── InfoBanner ───────────────────────────────────────────────────────────────
function InfoBanner({ color = "blue", icon, children }) {
  const map = {
    blue:  ["#EFF6FF","#BFDBFE","#1E40AF"],
    amber: ["#FFFBEB","#FDE68A","#92400E"],
    green: ["#ECFDF5","#A7F3D0","#065F46"],
    red:   ["#FEF2F2","#FECACA","#991B1B"],
  };
  const [bg, border, text] = map[color] || map.blue;
  return (
    <div className="flex gap-2.5 px-4 py-3.5 rounded-xl items-start" style={{ background:bg, border:`1px solid ${border}` }}>
      <span className="flex-shrink-0 mt-px" style={{ color:text }}>{icon || <IInfo size={16} color={text}/>}</span>
      <p className="m-0 text-sm leading-relaxed" style={{ color:text }}>{children}</p>
    </div>
  );
}

// ChangeEventTypeModal removed — replaced by inline dropdown in SummaryCard

// ─── ChangeDateModal ──────────────────────────────────────────────────────────
// FIX (bug #1 — "edit date not selected when opened"):
//   `selection` was being recomputed on every `onSelectionChange` fire, and
//   the PremiumCalendar `key` was derived from that *live* state. If
//   PremiumCalendar reports anything back on mount (very common), the key
//   changed immediately and PremiumCalendar remounted, wiping out the
//   seeded initial date before it was ever visible.
//   Fix: derive the seed once from props via useMemo, and key/init the
//   calendar off that stable value instead of the live selection state.
//
// FIX (bug #2 — "availability not showing in calendar"):
//   bookingData / bookingFull / bookingParial were hardcoded to {}/[]/[],
//   so PremiumCalendar had no availability info to render. These are now
//   passed in as real props from the parent (fetched from the venue API).
function ChangeDateModal({ date, shift, venueshifts, bookingData, bookingFull, bookingParial, onSave, onClose }) {
  useLockScroll(onClose);
  const [resetKey]      = useState(0);
  const [resetShiftKey] = useState(0);

  // Seed from the currently booked date/shift instead of nulls, so the
  // modal reflects "already selected" state the first time it opens.
  // Computed once (memoized on the actual booked date/shift props) so it
  // does NOT get recalculated every time PremiumCalendar reports a
  // selection change back up to us.
  const initialSelection = useMemo(() => {
    if (!date) return { date: null, shift: null, shiftLabel: null };
    const parsed = new Date(date);
    return {
      date: isNaN(parsed.getTime()) ? null : parsed,
      shift: shift || null,
      shiftLabel: shift || null,
    };
  }, [date, shift]);

  const [selection, setSelection] = useState(initialSelection);

  const hasShifts = venueshifts.length > 0;
  const canSave   = !!selection.date && (!hasShifts || !!selection.shiftLabel);

  const handleSave = () => {
    const d = selection.date;
    const dateStr = d
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      : date;
    onSave(dateStr, selection.shiftLabel || shift);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm" style={{ background:"rgba(15,15,15,0.6)" }}>
      <div className="pax-modal rounded-2xl w-full shadow-2xl flex flex-col overflow-hidden" style={{ background:"var(--pax-card)", maxWidth:"700px", maxHeight:"90vh" }}>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b" style={{ borderColor:"var(--pax-brd3)" }}>
          <h2 className="font-bold text-lg m-0" style={{ color:"var(--pax-t1)" }}>Change Date &amp; Shift</h2>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-0 transition-colors hover:bg-[var(--pax-muted2)]"
            style={{ background:"var(--pax-muted)", color:"var(--pax-t3)" }}>
            <IClose size={16} sw={2}/>
          </button>
        </div>
        {/* Calendar body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <PremiumCalendar
            // key is derived from the STABLE, memoized initialSelection —
            // not the live `selection` state — so the calendar only
            // remounts when the booked date/shift actually changes (e.g.
            // reopening the modal for a different booking), never as a
            // side-effect of the user or PremiumCalendar itself updating
            // `selection` while the modal is open.
            key={`${initialSelection.date ? initialSelection.date.getTime() : "none"}-${initialSelection.shiftLabel || "none"}`}
            venueshifts={venueshifts}
            bookingData={bookingData || {}}
            bookingFull={bookingFull || []}
            bookingParial={bookingParial || []}
            category="venues"
            isMember={false}
            onSelectionChange={setSelection}
            resetKey={resetKey}
            resetShiftKey={resetShiftKey}
            // Pass the SAME memoized date/shift used for the key above, so
            // PremiumCalendar can't parse a different value than what the
            // modal's own footer/summary displays.
            initialDate={initialSelection.date}
            initialShift={initialSelection.shiftLabel}
          />
        </div>
        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t flex items-center justify-between gap-3" style={{ borderColor:"var(--pax-brd3)" }}>
          <p className="m-0 text-sm" style={{ color:"var(--pax-t4)" }}>
            {!selection.date
              ? "Pick a date on the calendar"
              : hasShifts && !selection.shiftLabel
              ? "Now select a shift"
              : selection.date.toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" }) + (selection.shiftLabel ? ` · ${selection.shiftLabel}` : "")}
          </p>
          <div className="flex gap-3 flex-shrink-0">
            <BtnSecondary type="button" onClick={onClose}>Cancel</BtnSecondary>
            <BtnPrimary type="button" disabled={!canSave} onClick={handleSave}>Save</BtnPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ChangeGuestsModal ────────────────────────────────────────────────────────
function ChangeGuestsModal({ adultCount, childCount, onSave, onClose }) {
  useLockScroll(onClose);
  const [adults, setAdults] = useState(adultCount);
  const [children, setChildren] = useState(childCount);
  const total = adults + children;
  const GRow = ({ label, sub, value, onChange, min = 0 }) => (
    <div className="flex items-center justify-between gap-4 py-4 border-b last:border-b-0" style={{ borderColor:"var(--pax-brd3)" }}>
      <div>
        <p className="font-semibold text-[0.9375rem] m-0" style={{ color:"var(--pax-t1)" }}>{label}</p>
        <p className="text-xs m-0 mt-0.5" style={{ color:"var(--pax-t4)" }}>{sub}</p>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <button type="button" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30 hover:border-[var(--pax-t2)]"
          style={{ borderColor:"var(--pax-brd)", background:"var(--pax-card)", color:"var(--pax-t1)" }}>
          <IMinus size={13} sw={2.5}/>
        </button>
        <span className="w-5 text-center font-semibold text-base" style={{ color:"var(--pax-t1)" }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-colors hover:border-[var(--pax-t2)]"
          style={{ borderColor:"var(--pax-brd)", background:"var(--pax-card)", color:"var(--pax-t1)" }}>
          <IPlus size={13} sw={2.5}/>
        </button>
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm" style={{ background:"rgba(15,15,15,0.6)" }}>
      <div className="pax-modal rounded-2xl w-full shadow-2xl overflow-hidden" style={{ background:"var(--pax-card)", maxWidth:"420px" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor:"var(--pax-brd3)" }}>
          <h2 className="font-bold text-lg m-0" style={{ color:"var(--pax-t1)" }}>Change Guests</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-0 transition-colors hover:bg-[var(--pax-muted2)]" style={{ background:"var(--pax-muted)", color:"var(--pax-t3)" }}>
            <IClose size={16} sw={2}/>
          </button>
        </div>
        <div className="px-6 py-1">
          <GRow label="Adults" sub="Age 13 and above" value={adults} onChange={setAdults}/>
          <GRow label="Children" sub="Ages 2–12" value={children} onChange={setChildren}/>
        </div>
        {total > 0 && total < MINIMUM_PAX && (
          <div className="mx-6 mb-3 flex gap-2 items-start px-3 py-2.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB]">
            <IWarn size={13} color="#92400E" sw={2}/>
            <p className="text-xs m-0 text-[#78350F]">Minimum <strong>{MINIMUM_PAX}</strong> guests required for this venue</p>
          </div>
        )}
        <div className="px-6 py-4 border-t flex justify-between items-center gap-3" style={{ borderColor:"var(--pax-brd3)" }}>
          <p className="m-0 text-sm" style={{ color:"var(--pax-t4)" }}>{total} guest{total !== 1 ? "s" : ""} total</p>
          <div className="flex gap-3">
            <BtnSecondary type="button" onClick={onClose}>Cancel</BtnSecondary>
            <BtnPrimary type="button" onClick={() => { onSave(adults, children); onClose(); }}>Save</BtnPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SummaryCard ─────────────────────────────────────────────────────────────
function SummaryCard({ pricing, ctx, coverImage, selectedPackage, menuTab, customMenuItems, adultCount, childCount = 0, setAdultCount, setChildCount, bookingEventType, setBookingEventType, bookingDate, setBookingDate, bookingShift, setBookingShift, venueshifts = [], onOpenDateModal, onOpenGuestsModal, flat = false }) {
  const { foodTotal, addonSummary: addonAmt, minimumCharge, tax5, tax18, total } = pricing;
  const hasPrice    = total > 0;
  const belowMin    = adultCount > 0 && adultCount < MINIMUM_PAX;
  const totalGuests = adultCount + childCount;
  const displayEventType = bookingEventType || ctx.eventType;
  const displayDate      = bookingDate      || ctx.date;
  const displayShift     = bookingShift     || ctx.shift;

  const [eventTypeOpen,   setEventTypeOpen]   = useState(false);
  const [eventTypeSearch, setEventTypeSearch] = useState("");

   
  

  const priceRows = [];
  if (selectedPackage && adultCount > 0)
    priceRows.push({ label:`${adultCount} guests × ${fmt(selectedPackage.package_amount)}`, value:foodTotal });
  else if (menuTab === "custom" && customMenuItems.length > 0)
    priceRows.push({ label:`${customMenuItems.length} custom item${customMenuItems.length !== 1 ? "s" : ""}`, value:foodTotal });
  if (tax5    > 0) priceRows.push({ label:"GST 5% (Food)",      value:tax5   });
  if (addonAmt > 0) priceRows.push({ label:"Add-ons",           value:addonAmt });
  if (tax18   > 0) priceRows.push({ label:"GST 18% (Add-ons)", value:tax18  });

  const Row = ({ label, value }) => (
    <div className="flex justify-between gap-2">
      <span className="text-sm" style={{ color:"var(--pax-t2)" }}>{label}</span>
      <span className="text-sm flex-shrink-0" style={{ color:"var(--pax-t2)" }}>{fmt(value)}</span>
    </div>
  );

  const SectionDivider = () => <div className="h-px" style={{ background:"var(--pax-brd3)" }}/>;

  // Airbnb-style Change button: white bg, gray border, dark text
  const ChangeBtn = ({ onClick }) => (
    <button type="button" onClick={onClick}
      className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer border transition-colors"
      style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd)", color:"var(--pax-t1)" }}>
      Change
    </button>
  );

  return (
    <div className={flat ? "" : "rounded-2xl overflow-hidden"} style={flat ? {} : { background:"var(--pax-card)", border:"1px solid var(--pax-brd3)" }}>

      {/* ── Venue header ── */}
      <div className="flex items-start gap-3 px-4 py-4">
        {/* Square thumbnail */}
        <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width:"88px", height:"88px", background:"linear-gradient(135deg,#3B0764,#7C3AED)" }}>
          {coverImage
            ? <img src={coverImage} alt={ctx.venueName || "Venue"} className="w-full h-full object-cover object-center block"/>
            : <div className="w-full h-full flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>}
        </div>
        {/* Names */}
        <div className="min-w-0 flex-1 pt-0.5">
          {ctx.parentVenueName && (
            <p className="text-xs m-0 mb-0.5 truncate" style={{ color:"var(--pax-t4)" }}>{ctx.parentVenueName}</p>
          )}
          {ctx.venueName && (
            <p className="font-semibold text-sm m-0 leading-snug truncate" style={{ color:"var(--pax-t1)" }}>{ctx.venueName}</p>
          )}
          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><path d="M12 17.75l-6.172 3.245l1.179-6.873l-5-4.867l6.9-1l3.086-6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/></svg>
            <span className="text-xs font-semibold" style={{ color:"var(--pax-t2)" }}>{ctx.venueRating}</span>
          </div>
          {/* Address — always shown when available */}
          <div className="flex items-start gap-1 mt-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--pax-t4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-px"><circle cx="12" cy="11" r="3"/><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
            <span className="text-xs leading-tight line-clamp-2" style={{ color:"var(--pax-t4)" }}>{ctx.venueAddress || "Address not provided"}</span>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px" style={{ background:"var(--pax-brd3)" }}/>
      {/* ── Body ── */}
      <div className="flex flex-col" style={{ padding:"0" }}>

        {/* Event type */}
        <div className="relative px-5 py-4">
          {eventTypeOpen ? (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setEventTypeOpen(false)}/>
              <div className="relative z-50">
                <p className="font-semibold text-sm m-0 mb-2" style={{ color:"var(--pax-t1)" }}>Event Type</p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background:"var(--pax-muted)", borderColor:"var(--pax-brd)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--pax-t4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input autoFocus type="text" placeholder="Search event type…" value={eventTypeSearch ?? ""} onChange={e => setEventTypeSearch(e.target.value)}
                    className="flex-1 bg-transparent border-0 outline-none text-sm" style={{ color:"var(--pax-t1)" }}/>
                  <button type="button" onClick={() => setEventTypeOpen(false)} className="border-0 bg-transparent cursor-pointer p-0" style={{ color:"var(--pax-t4)" }}>
                    <IClose size={14} sw={2}/>
                  </button>
                </div>
                <div className="absolute left-0 right-0 top-full mt-1 rounded-xl shadow-2xl overflow-hidden border" style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd)", maxHeight:"200px", overflowY:"auto" }}>
                  {EVENT_TYPE_OPTIONS.filter(o => !eventTypeSearch || o.toLowerCase().includes(eventTypeSearch.toLowerCase())).map(opt => {
                    const active = displayEventType === opt;
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setBookingEventType(opt); setEventTypeOpen(false); setEventTypeSearch(""); }}
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 cursor-pointer transition-colors border-0"
                        style={{ background: active ? "var(--pax-pll)" : "transparent", color: active ? P : "var(--pax-t2)", fontWeight: active ? 600 : 400 }}>
                        {active ? <ICheck size={13} color={P} sw={2.5}/> : <span className="w-[13px] flex-shrink-0"/>}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm m-0 mb-0.5" style={{ color:"var(--pax-t1)" }}>Event Type</p>
                <p className="text-sm m-0" style={{ color: displayEventType ? "var(--pax-t2)" : "var(--pax-t4)" }}>
                  {displayEventType || "Not set"}
                </p>
              </div>
              {setBookingEventType && <ChangeBtn onClick={() => { setEventTypeSearch(""); setEventTypeOpen(true); }}/>}
            </div>
          )}
        </div>

        <div className="mx-5 h-px" style={{ background:"var(--pax-brd3)" }}/>
        {/* Date */}
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <p className="font-semibold text-sm m-0 mb-0.5" style={{ color:"var(--pax-t1)" }}>Date</p>
            <p className="text-sm m-0" style={{ color:"var(--pax-t2)" }}>
              {displayDate ? fmtDate(displayDate) : <span style={{ color:"var(--pax-t4)" }}>Not set</span>}
            </p>
            {displayShift && (
              <p className="text-xs m-0 mt-0.5 flex items-center gap-1" style={{ color:"var(--pax-t3)" }}>
                <IClock size={10} color="var(--pax-t4)" sw={2}/> {displayShift}
              </p>
            )}
          </div>
          {setBookingDate && <ChangeBtn onClick={() => onOpenDateModal?.()}/>}
        </div>

        <div className="mx-5 h-px" style={{ background:"var(--pax-brd3)" }}/>
        {/* Guests */}
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <p className="font-semibold text-sm m-0 mb-0.5" style={{ color:"var(--pax-t1)" }}>Guests</p>
            <p className="text-sm m-0" style={{ color: totalGuests > 0 ? "var(--pax-t2)" : "var(--pax-t4)" }}>
              {totalGuests > 0
                ? `${adultCount} adult${adultCount !== 1 ? "s" : ""}${childCount > 0 ? ` · ${childCount} child${childCount !== 1 ? "ren" : ""}` : ""}`
                : "Not set"}
            </p>
          </div>
          {setAdultCount && <ChangeBtn onClick={() => onOpenGuestsModal?.()}/>}
        </div>

        {/* Package / custom menu */}
        {(selectedPackage || (menuTab === "custom" && customMenuItems.length > 0)) && (
          <><div className="mx-5 h-px" style={{ background:"var(--pax-brd3)" }}/>
          <div className="px-5 py-3">
            <p className="font-semibold text-sm m-0 mb-0.5" style={{ color:"var(--pax-t1)" }}>Menu</p>
            <p className="text-sm m-0 flex items-center gap-1.5" style={{ color:"var(--pax-t2)" }}>
              <IUtensils size={12} color="var(--pax-t3)" sw={2}/>
              {selectedPackage ? selectedPackage.package_name : `${customMenuItems.length} custom item${customMenuItems.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          </>
        )}

        {/* Price details */}
        <div className="px-5 py-3">
          {!hasPrice ? (
            <div className="text-center py-2">
              {menuTab === "custom" && customMenuItems.length > 0 ? (
                <>
                  <p className="font-semibold text-sm m-0 mb-1" style={{ color:"var(--pax-t2)" }}>Custom Pricing</p>
                  <p className="text-xs m-0 leading-relaxed" style={{ color:"var(--pax-t4)" }}>Price will be discussed after the enquiry is submitted</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-sm m-0 mb-1" style={{ color:"var(--pax-t2)" }}>No price yet</p>
                  <p className="text-xs m-0" style={{ color:"var(--pax-t4)" }}>Select a package and add guests</p>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <p className="font-semibold text-sm m-0" style={{ color:"var(--pax-t1)" }}>Price details</p>
              {priceRows.map((r, i) => <Row key={i} label={r.label} value={r.value}/>)}
              {minimumCharge > 0 && (
                <div className="flex justify-between gap-2">
                  <span className="text-sm flex items-center gap-1" style={{ color:"var(--pax-t2)" }}>
                    <IWarn size={12} color="#D97706" sw={2}/> Min. Guest Charge
                  </span>
                  <span className="text-sm flex-shrink-0 text-[#D97706]">{fmt(minimumCharge)}</span>
                </div>
              )}
              <SectionDivider/>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <span className="font-bold text-sm" style={{ color:"var(--pax-t1)" }}>Estimated Total</span>
                <span className="text-base font-bold flex-shrink-0" style={{ color:"var(--pax-t1)" }}>{fmt(total)}</span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}


// ─── GuestCounter ─────────────────────────────────────────────────────────────
// Standalone guest count section — rendered at top of merged Step 1.
function GuestCounter({ adultCount, setAdultCount, childCount, setChildCount }) {
  const total    = adultCount + childCount;
  const belowMin = total > 0 && total < MINIMUM_PAX;

  const CounterRow = ({ label, sub, value, onChange }) => (
    <div className="flex items-center justify-between gap-4 py-4 border-b last:border-b-0" style={{ borderColor:"var(--pax-brd3)" }}>
      <div className="min-w-0">
        <p className="font-medium text-[0.9375rem] m-0 leading-tight" style={{ color:"var(--pax-t1)" }}>{label}</p>
        <p className="text-xs m-0 mt-0.5" style={{ color:"var(--pax-t4)" }}>{sub}</p>
      </div>
      {/* Joined pill control */}
      <div className="flex items-center flex-shrink-0 rounded-xl overflow-hidden border" style={{ borderColor:"var(--pax-brd)" }}>
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value === 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="pax-counter-btn flex items-center justify-center w-10 h-10 border-0 cursor-pointer transition-colors disabled:opacity-35 disabled:cursor-not-allowed hover:bg-[var(--pax-muted2)]"
          style={{ background:"var(--pax-card)", color: value === 0 ? "var(--pax-t4)" : "var(--pax-t1)" }}
        >
          <IMinus size={14} sw={2.5}/>
        </button>
        <div className="w-px self-stretch" style={{ background:"var(--pax-brd)" }}/>
        <input
          type="number"
          min={0}
          max={9999}
          value={value}
          onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          aria-label={`${label} count`}
          className="w-14 h-10 text-center font-bold text-base border-0 focus:outline-none appearance-none"
          style={{ color:"var(--pax-t1)", background:"var(--pax-card)", fontFamily:"inherit" }}
        />
        <div className="w-px self-stretch" style={{ background:"var(--pax-brd)" }}/>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
          className="pax-counter-btn flex items-center justify-center w-10 h-10 border-0 cursor-pointer transition-colors"
          style={{ background:"var(--pax-card)", color:"var(--pax-t1)" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--pax-muted2)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--pax-card)"}
        >
          <IPlus size={14} sw={2.5}/>
        </button>
      </div>
    </div>
  );

  return (
    <Section bare title="Guest Count" subtitle="How many guests are attending your event?">
      <div className={belowMin ? "mb-4" : ""}>
        <CounterRow label="Adults"   sub="Age 13 and above" value={adultCount} onChange={setAdultCount}/>
        <CounterRow label="Children" sub="Age 2–12 years"   value={childCount} onChange={setChildCount}/>
      </div>
      {belowMin && (
        <InfoBanner color="amber" icon={<IWarn size={16} color="#92400E" sw={2}/>}>
          Minimum capacity is <strong>{MINIMUM_PAX} guests</strong>. A minimum charge applies for the shortfall of {MINIMUM_PAX - total} guests.
        </InfoBanner>
      )}
    </Section>
  );
}

// ─── Step 2 — Food Menu ───────────────────────────────────────────────────────
function StepFoodMenu({ menuTab, packagesList, loadingPackages, selectedPackage, adultCount, openPackageModal, customMenuItems, openCustomMenuModal, removeCustomItem, onSwitchTab }) {
  const groupedCustom = useMemo(() => {
    const m = {};
    customMenuItems.forEach(i => { const c = i.category_name || "Other"; if (!m[c]) m[c] = []; m[c].push(i); });
    return m;
  }, [customMenuItems]);

  return (
    <Section bare title="Food Menu" subtitle="Choose a preset package or build your own custom menu.">

        {/* Tab switcher — underline style */}
        <div className="flex border-b mb-7" style={{ borderColor:"var(--pax-brd3)" }}>
          {[{ id:"packages", label:"Preset Packages" }, { id:"custom", label:"Custom Menu" }].map(tab => {
            const active = menuTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSwitchTab(tab.id)}
                className="relative px-4 py-2.5 border-0 text-sm cursor-pointer transition-colors bg-transparent"
                style={{ color: active ? "var(--pax-t1)" : "var(--pax-t4)", fontWeight: active ? 600 : 400 }}
              >
                {tab.label}
                {active && <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background:"var(--pax-t1)" }}/>}
              </button>
            );
          })}
        </div>

        {/* Packages tab */}
        {menuTab === "packages" && (
          loadingPackages ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1,2,3,4].map(n => (
                <div key={n} className="rounded-2xl h-52" style={{ background:"linear-gradient(90deg,var(--pax-muted2) 25%,var(--pax-brd) 50%,var(--pax-muted2) 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>
              ))}
            </div>
          ) : packagesList.length === 0 ? (
            <div className="text-center py-12 px-8 rounded-2xl border-2 border-dashed" style={{ borderColor:"var(--pax-brd)" }}>
              <IUtensils size={32} color="#D1D5DB" sw={1.25}/>
              <p className="font-semibold mt-4 mb-1 m-0" style={{ color:"var(--pax-t2)" }}>No packages available</p>
              <p className="text-sm m-0" style={{ color:"var(--pax-t4)" }}>Please contact the venue directly.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {packagesList.map(pkg => {
                const isSel  = selectedPackage?.id === pkg.id;
                const perPax = pkg.package_amount || 0;
                const pkgTotal = perPax * adultCount;
                return (
                  <div
                    key={pkg.id}
                    className="pkg-card relative rounded-2xl p-5 cursor-pointer border flex flex-col gap-4"
                    onClick={() => openPackageModal(pkg)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSel}
                    onKeyDown={e => e.key === "Enter" && openPackageModal(pkg)}
                    style={{
                      background: "var(--pax-card)",
                      borderColor: isSel ? "var(--pax-t2)" : "var(--pax-brd3)",
                      boxShadow: isSel ? "inset 0 0 0 1px var(--pax-t2)" : "none",
                    }}
                  >
                    {/* Badge row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {pkg.package_food_type === 1 && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold bg-[#F0FDF4] text-[#15803D]">
                            <ILeaf size={10} color="#15803D" sw={2}/> Veg
                          </span>
                        )}
                        {pkg.package_food_type === 2 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold bg-[#FFF1F2] text-[#BE123C]">Non-Veg</span>
                        )}
                        {pkg.categories?.length > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold" style={{ background:"var(--pax-muted2)", color:"var(--pax-t3)" }}>
                            {pkg.categories.length} courses
                          </span>
                        )}
                      </div>
                      {isSel && (
                        <span className="px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium flex-shrink-0" style={{ background:"var(--pax-t1)", color:"var(--pax-card)" }}>
                          Selected
                        </span>
                      )}
                      {pkg.is_popular && !isSel && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium flex-shrink-0" style={{ background:"var(--pax-muted2)", color:"var(--pax-t3)" }}>
                          Popular
                        </span>
                      )}
                    </div>

                    {/* Name + price inline */}
                    <div className="flex items-baseline justify-between gap-3 min-w-0">
                      <h4 className="font-bold text-base m-0 truncate" style={{ color:"var(--pax-t1)" }}>{pkg.package_name}</h4>
                      <p className="m-0 flex-shrink-0">
                        <span className="font-bold text-base" style={{ color:"var(--pax-t1)" }}>{fmt(perPax)}</span>
                        <span className="text-xs font-normal" style={{ color:"var(--pax-t4)" }}>/person</span>
                      </p>
                    </div>

                    {/* Total row */}
                    <div className="flex items-center justify-between pt-3.5 border-t mt-auto" style={{ borderColor: isSel ? "var(--pax-pl)" : "var(--pax-brd3)" }}>
                      {adultCount > 0 ? (
                        <>
                          <span className="text-[0.8125rem]" style={{ color:"var(--pax-t4)" }}>{adultCount} × {fmt(perPax)}</span>
                          <span className="font-bold text-base" style={{ color:"var(--pax-t1)" }}>{fmt(pkgTotal)}</span>
                        </>
                      ) : (
                        <span className="text-[0.8125rem]" style={{ color:"var(--pax-t4)" }}>Set guest count to see total</span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Custom tab */}
        {menuTab === "custom" && (
          customMenuItems.length === 0 ? (
            <div
              onClick={openCustomMenuModal}
              className="text-center py-14 px-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-[var(--pax-p)] hover:bg-[var(--pax-pll)]"
              style={{ borderColor:"var(--pax-brd)" }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background:"var(--pax-muted2)" }}>
                <IUtensils size={22} color="var(--pax-t3)" sw={1.75}/>
              </div>
              <p className="font-bold text-base m-0 mb-1.5" style={{ color:"var(--pax-t1)" }}>Build Your Custom Menu</p>
              <p className="text-sm m-0 mb-6 leading-relaxed" style={{ color:"var(--pax-t4)" }}>Pick items from our full catalogue across all categories</p>
              <BtnPrimary type="button" onClick={e => { e.stopPropagation(); openCustomMenuModal(); }}>
                Browse Menu Items
              </BtnPrimary>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-bold text-[0.9375rem] m-0" style={{ color:"var(--pax-t1)" }}>{customMenuItems.length} items selected</p>
                  <p className="text-[0.8125rem] m-0 mt-0.5" style={{ color:"var(--pax-t4)" }}>{Object.keys(groupedCustom).length} categories</p>
                </div>
                <BtnSecondary type="button" onClick={openCustomMenuModal} style={{ height:"38px", fontSize:"0.875rem" }}>
                  Edit Selection
                </BtnSecondary>
              </div>
              <div className="rounded-2xl overflow-hidden border" style={{ borderColor:"var(--pax-brd3)" }}>
                {Object.entries(groupedCustom).map(([cat, items], gi) => (
                  <div key={cat} className="px-4 py-3.5" style={{ borderBottom: gi < Object.keys(groupedCustom).length - 1 ? "1px solid var(--pax-brd3)" : "none" }}>
                    <p className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] m-0 mb-2.5" style={{ color:"var(--pax-t4)" }}>{cat}</p>
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-2 py-1">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.food_type === 1 ? "#16A34A" : "#DC2626" }}/>
                        <span className="flex-1 text-[0.9375rem]" style={{ color:"var(--pax-t2)" }}>{item.item_name}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${item.item_name}`}
                          onClick={() => removeCustomItem(item.id)}
                          className="flex p-1 rounded-md border-0 cursor-pointer transition-colors hover:text-red-500 bg-transparent"
                          style={{ color:"var(--pax-t4)" }}
                        >
                          <IClose size={14} sw={2}/>
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
    </Section>
  );
}


// ─── Step 3 — Requirements ────────────────────────────────────────────────────
function StepRequirements({ dietary, setDietary, allergies, setAllergies, otherAllergy, setOtherAllergy, servingPref, setServingPref, notes, setNotes }) {

  // Chip: hides the real input visually, pure pill appearance
  const Chip = ({ checked, onChange, label, type = "checkbox", name }) => (
    <label
      className="pax-chip flex items-center gap-1.5 px-4 py-2 rounded-full cursor-pointer select-none border"
      style={{
        borderColor: checked ? "var(--pax-t1)" : "var(--pax-brd)",
        background:  "var(--pax-card)",
        color:       checked ? "var(--pax-t1)" : "var(--pax-t3)",
      }}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only"/>
      {checked && <ICheck size={12} color="var(--pax-t1)" sw={2.5}/>}
      <span className={`text-sm ${checked ? "font-semibold" : "font-medium"}`}>{label}</span>
    </label>
  );

  const ServingCard = ({ label, checked, onChange }) => (
    <label
      className="pax-chip flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer select-none border text-center transition-all"
      style={{
        borderColor: checked ? "var(--pax-t1)" : "var(--pax-brd)",
        background:  "var(--pax-card)",
        boxShadow:   "none",
      }}
    >
      <input type="radio" name="servingPref" checked={checked} onChange={onChange} className="sr-only"/>
      <span className="text-[0.9375rem]" style={{ color: "var(--pax-t1)", fontWeight: checked ? 600 : 400 }}>
        {label}
      </span>
      {checked && <ICheckCirc size={16} color="var(--pax-t1)" sw={2}/>}
    </label>
  );

  return (
    <div className="pax-card flex flex-col rounded-2xl border p-6" style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd3)" }}>

      {/* Dietary restrictions */}
      <Section bare title="Dietary Restrictions" subtitle="Select all that apply to your guest group.">
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map(opt => (
            <Chip
              key={opt.id}
              type="checkbox"
              checked={!!dietary[opt.id]}
              onChange={e => setDietary(p => ({ ...p, [opt.id]: e.target.checked }))}
              label={opt.label}
            />
          ))}
        </div>
      </Section>

      <Divider className="my-7"/>
      {/* Food allergies */}
      <Section bare title="Food Allergies" subtitle="Important for our kitchen team.">
        <div className="flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map(opt => (
            <Chip
              key={opt.id}
              type="checkbox"
              checked={!!allergies[opt.id]}
              onChange={e => setAllergies(p => ({ ...p, [opt.id]: e.target.checked }))}
              label={opt.label}
            />
          ))}
        </div>
        {allergies.other && (
          <div className="mt-4">
            <PaxInput
              label="Specify other allergies"
              value={otherAllergy}
              onChange={e => setOtherAllergy(e.target.value)}
              placeholder="Please describe the allergy"
              type="text"
            />
          </div>
        )}
      </Section>

      <Divider className="my-7"/>
      {/* Serving style */}
      <Section bare title="Serving Style" subtitle="How would you like the food to be served?">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SERVING_PREFS.map(pref => (
            <ServingCard
              key={pref}
              label={pref}
              checked={servingPref === pref}
              onChange={() => setServingPref(pref)}
            />
          ))}
        </div>
      </Section>

      <Divider className="my-7"/>
      {/* Additional notes */}
      <Section bare title="Additional Notes">
        <FieldWrap hint="Decor theme, live music, seating preferences, or any other special requests">
          <textarea
            rows={4}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="E.g. Garden-themed decor, live ghazal music setup, bride's side left-facing..."
            className="pax-input w-full p-4 rounded-xl resize-y leading-relaxed border-[1.5px] focus:outline-none"
            style={{
              borderColor: "var(--pax-brd)",
              color: "var(--pax-t1)",
              background: "var(--pax-card)",
              fontSize: "0.9375rem",
              fontFamily: "inherit",
            }}
          />
        </FieldWrap>
      </Section>
    </div>
  );
}

// ─── Step 4 — Contact ─────────────────────────────────────────────────────────
function StepContact({ name, setName, email, setEmail, phone, setPhone, org, setOrg, errors }) {
  return (
    <Section title="Contact Information" subtitle="We will send your quote and updates to these details." className="pax-card">
        <div className="flex flex-col gap-5">
          <PaxInput
            label="Full Name"
            required
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
            error={errors.name}
            icon={<IUsers size={16} color="var(--pax-t4)" sw={1.75}/>}
          />
          <div className="grid sm:grid-cols-2 gap-5">
            <PaxInput
              label="Email Address"
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              error={errors.email}
              icon={<IMail size={16} color="var(--pax-t4)" sw={1.75}/>}
            />
            <PaxInput
              label="Phone Number"
              required
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              error={errors.phone}
              icon={<IPhone size={16} color="var(--pax-t4)" sw={1.75}/>}
            />
          </div>
          <FieldWrap label="Organization" hint="Company or organization name (optional)">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex pointer-events-none" style={{ color:"var(--pax-t4)" }}>
                <IBuild size={16} sw={1.75}/>
              </span>
              <input
                type="text"
                value={org}
                onChange={e => setOrg(e.target.value)}
                placeholder="Company name"
                className="pax-input w-full h-12 rounded-xl text-[0.9375rem] border-[1.5px] focus:outline-none"
                style={{ paddingLeft:"42px", paddingRight:"14px", borderColor:"var(--pax-brd)", color:"var(--pax-t1)", background:"var(--pax-card)", fontFamily:"inherit" }}
              />
            </div>
          </FieldWrap>
        </div>
    </Section>
  );
}

// ─── Step 5 — Review ──────────────────────────────────────────────────────────
function StepReview({ ctx, adultCount, childCount, menuTab, selectedPackage, customMenuItems, dietary, allergies, otherAllergy, servingPref, notes, name, email, phone, org, pricing }) {
  const actD = Object.entries(dietary).filter(([,v]) => v).map(([k]) => DIETARY_OPTIONS.find(o => o.id === k)?.label).filter(Boolean);
  const actA = Object.entries(allergies).filter(([,v]) => v).map(([k]) => k === "other" ? (otherAllergy || "Other") : ALLERGY_OPTIONS.find(o => o.id === k)?.label).filter(Boolean);
  const grp  = useMemo(() => {
    const m = {};
    customMenuItems.forEach(i => { const c = i.category_name || "Other"; if (!m[c]) m[c] = []; m[c].push(i); });
    return m;
  }, [customMenuItems]);

  const ReviewRow = ({ label, value }) => value ? (
    <div className="flex gap-4 py-2.5 border-b last:border-0" style={{ borderColor:"var(--pax-brd3)" }}>
      <span className="text-[0.8125rem] flex-shrink-0 w-28 pt-px" style={{ color:"var(--pax-t4)" }}>{label}</span>
      <span className="text-[0.9375rem] font-medium leading-snug" style={{ color:"var(--pax-t1)" }}>{String(value)}</span>
    </div>
  ) : null;

  const ReviewBlock = ({ icon, title, children }) => (
    <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid var(--pax-brd3)" }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ background:"var(--pax-muted)" }}>
        <span style={{ color:"var(--pax-t3)" }}>{icon}</span>
        <p className="font-bold text-[0.8125rem] uppercase tracking-[0.04em] m-0" style={{ color:"var(--pax-t2)" }}>{title}</p>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );

  return (
    <div className="pax-card flex flex-col gap-5 rounded-2xl border p-6" style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd3)" }}>
      <div>
        <h2 className="font-extrabold text-[1.375rem] m-0 mb-1" style={{ color:"var(--pax-t1)" }}>Review &amp; Submit</h2>
        <p className="text-[0.9375rem] m-0" style={{ color:"var(--pax-t3)" }}>Everything looks good? Submit your enquiry below.</p>
      </div>

      <ReviewBlock title="Event Details" icon={<ICalendar size={14} sw={2}/>}>
        <ReviewRow label="Event Type" value={ctx.eventType}/>
        <ReviewRow label="Date"       value={fmtDate(ctx.date)}/>
        <ReviewRow label="Shift"      value={ctx.shift}/>
        <ReviewRow label="Venue"      value={ctx.venueName}/>
      </ReviewBlock>

      <ReviewBlock title="Guest Count" icon={<IUsers size={14} sw={2}/>}>
        <ReviewRow label="Adults"       value={adultCount}/>
        {childCount > 0 && <ReviewRow label="Children" value={childCount}/>}
        <ReviewRow label="Total Guests" value={adultCount + childCount}/>
      </ReviewBlock>

      <ReviewBlock title="Menu Selection" icon={<IUtensils size={14} sw={2}/>}>
        {menuTab === "packages" && selectedPackage ? (
          <>
            <ReviewRow label="Package" value={selectedPackage.package_name}/>
            <ReviewRow label="Rate"    value={`${fmt(selectedPackage.package_amount)} / person`}/>
          </>
        ) : menuTab === "custom" && customMenuItems.length > 0 ? (
          <>
            <ReviewRow label="Type" value="Custom Menu"/>
            {Object.entries(grp).map(([c, its]) => (
              <ReviewRow key={c} label={c} value={its.map(i => i.item_name).join(", ")}/>
            ))}
          </>
        ) : (
          <ReviewRow label="Menu" value="Not yet selected"/>
        )}
      </ReviewBlock>

      {(actD.length > 0 || actA.length > 0 || servingPref || notes) && (
        <ReviewBlock title="Special Requirements" icon={<IFile size={14} sw={2}/>}>
          {actD.length > 0 && <ReviewRow label="Dietary"       value={actD.join(", ")}/>}
          {actA.length > 0 && <ReviewRow label="Allergies"     value={actA.join(", ")}/>}
          {servingPref      && <ReviewRow label="Serving Style" value={servingPref}/>}
          {notes            && <ReviewRow label="Notes"         value={notes}/>}
        </ReviewBlock>
      )}

      <ReviewBlock title="Contact Details" icon={<IUsers size={14} sw={2}/>}>
        <ReviewRow label="Name"         value={name}/>
        <ReviewRow label="Email"        value={email}/>
        <ReviewRow label="Phone"        value={phone}/>
        {org && <ReviewRow label="Organization" value={org}/>}
      </ReviewBlock>

      {pricing.total > 0 && (
        <div
          className="flex justify-between items-center rounded-2xl px-6 py-5 border"
          style={{ background:"var(--pax-muted)", borderColor:"var(--pax-brd3)" }}
        >
          <div>
            <p className="text-[0.8125rem] font-semibold m-0 mb-0.5" style={{ color:"var(--pax-t2)" }}>Estimated Total</p>
            <p className="text-[0.8125rem] m-0" style={{ color:"var(--pax-t4)" }}>Incl. applicable taxes</p>
          </div>
          <span className="font-bold text-[1.875rem]" style={{ color:"var(--pax-t1)" }}>{fmt(pricing.total)}</span>
        </div>
      )}

      <InfoBanner color="blue">
        By submitting, you agree to receive a quote via email within 24 hours. No payment is required at this stage.
      </InfoBanner>
    </div>
  );
}


// ─── PackageModal ─────────────────────────────────────────────────────────────
function PackageModal({ pkg, menuCategories, menuItems, selections, setSelections, onCancel, onConfirm, isMobile }) {
  useLockScroll(onCancel);
  const [expanded,    setExpanded]    = useState({});
  const [showPreview, setShowPreview] = useState(false);

 

  const categories = useMemo(() => {
  if (!pkg || !menuCategories) return [];
  const ids = new Set((pkg.categories || []).map(c => c.id ?? c));
  return ids.size > 0 ? menuCategories.filter(c => ids.has(c.id)) : menuCategories;
}, [pkg, menuCategories]);

  const toggle     = id => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const toggleItem = (catId, item) => setSelections(p => {
    const cur = p[catId] || [];
    return { ...p, [catId]: cur.some(i => i.id === item.id) ? cur.filter(i => i.id !== item.id) : [...cur, item] };
  });
  const done   = categories.filter(c => (selections[c.id] || []).length > 0).length;
  const allOk  = categories.length > 0 && done === categories.length;

  // const forCat = cid => (menuItems || []).filter(i => i.category_id === cid);
  const forCat = cid =>
  (menuItems || []).filter(
    i => i.category_id === cid &&
    (!pkg?.allowed_item_ids?.length || pkg.allowed_item_ids.includes(i.id))
  );
  const preview = useMemo(() => {
    const m = {};
    categories.forEach(c => { const s = selections[c.id] || []; if (s.length) m[c.name] = s; });
    return m;
  }, [categories, selections]);

  const totalSelected = Object.values(preview).flat().length;

  // ── Shared accordion (plain render fn, not a component) ──
  // const maxPerCat = pkg?.max_items_per_category || 2;
  const getMaxPerCategory = (categoryId) => {
  return (
    pkg?.category_requirements?.find(
      (c) => Number(c.id) === Number(categoryId)
    )?.count ?? pkg?.max_items_per_category ?? 0
  );
};



  const renderAccordion = (px = "px-7") => categories.map((cat, ci) => {
    const catItems = forCat(cat.id), catSel = selections[cat.id] || [], isOpen = !!expanded[cat.id];
   // const isAtMax = catSel.length >= maxPerCat;
   

    const maxPerCat = getMaxPerCategory(cat.id);
const isAtMax = catSel.length >= maxPerCat;
 const isFull  = catSel.length > 0;
    return (
      <div key={cat.id} className="mb-3 rounded-xl overflow-hidden border transition-colors duration-200" style={{ borderColor: isFull ? "#BBF7D0" : "var(--pax-muted2)" }}>
        <div className="flex items-center gap-3 px-4 py-4 cursor-pointer" style={{ background: isFull ? "#F0FDF4" : "var(--pax-muted)" }} onClick={() => toggle(cat.id)}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[0.8125rem] flex-shrink-0" style={{ background: isFull ? "#059669" : P, color:"#fff" }}>
            {isFull ? <ICheck size={13} color="#fff" sw={2.5}/> : ci + 1}
          </div>
          <div className="flex-1">
            <p className="font-bold text-[0.9375rem] m-0" style={{ color:"var(--pax-t1)" }}>{cat.name}</p>
            <p className="text-[0.8125rem] m-0 mt-px font-semibold" style={{ color: isFull ? "#059669" : "var(--pax-t4)" }}>
              {isFull
                ? `${catSel.length}/${maxPerCat} items selected${isAtMax ? " · Max reached" : ""}`
                : `Select up to ${maxPerCat} items`}
            </p>
          </div>
          <IChevD rot={isOpen} size={18} color="var(--pax-t3)" sw={2}/>
        </div>
        {catSel.length > 0 && !isOpen && (
          <div className="px-4 pt-2 pb-3.5 flex flex-wrap gap-1.5">
            {catSel.map(item => (
              <span key={item.id} className="text-xs px-2.5 py-0.5 rounded-full font-medium border" style={{ background:"var(--pax-muted2)", color:"var(--pax-t2)", borderColor:"var(--pax-brd3)" }}>
                {item.item_name}
              </span>
            ))}
          </div>
        )}
        {isOpen && (
          <div className="px-4 py-4 border-t" style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd3)" }}>
            <div className="grid gap-2" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))" }}>
              {catItems.map(item => {
                const isSel     = catSel.some(i => i.id === item.id);
                const isDisabled = isAtMax && !isSel;
                return (
                  <div key={item.id}
                    onClick={() => !isDisabled && toggleItem(cat.id, item)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all"
                    style={{
                      borderColor: isSel ? P : "var(--pax-brd)",
                      background: isSel ? "var(--pax-pll)" : isDisabled ? "var(--pax-muted)" : "var(--pax-card)",
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.45 : 1,
                    }}>
                    <input type="checkbox" checked={isSel} readOnly disabled={isDisabled} className="w-3.5 h-3.5 flex-shrink-0 pointer-events-none" style={{ accentColor:P }}/>
                    <span className="flex-1 text-sm" style={{ color: isSel ? P : "var(--pax-t2)", fontWeight: isSel ? 600 : 400 }}>{item.item_name}</span>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.food_type === 1 ? "#16A34A" : "#DC2626" }}/>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  });

  // ── Shared header ──
  const renderHeader = (compact = false) => (
    <div className={`flex-shrink-0 border-b ${compact ? "px-6 py-4" : "px-7 py-6"}`} style={{ borderColor:"var(--pax-brd3)" }}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.06em] m-0 mb-1" style={{ color:"var(--pax-t4)" }}>Customise Package</p>
          <h2 className={`font-extrabold m-0 ${compact ? "text-lg" : "text-xl"}`} style={{ color:"var(--pax-t1)" }}>{pkg?.package_name}</h2>
          {!compact && <p className="text-sm m-0 mt-1" style={{ color:"var(--pax-t4)" }}>Select at least one item from each category</p>}
        </div>
        <button type="button" aria-label="Close modal" onClick={onCancel}
          className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 border transition-colors hover:bg-[var(--pax-muted2)]"
          style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd)", color:"var(--pax-t3)" }}>
          <IClose size={16} sw={2}/>
        </button>
      </div>
      <div className={compact ? "mt-3" : "mt-4"}>
        <div className="flex justify-between mb-1.5">
          <span className="text-[0.8125rem] font-semibold" style={{ color:"var(--pax-t2)" }}>Progress</span>
          <span className="text-[0.8125rem] font-bold" style={{ color: allOk ? "#059669" : P }}>{done}/{categories.length} categories</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"var(--pax-muted2)" }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width:`${categories.length ? (done / categories.length) * 100 : 0}%`, background: allOk ? "#059669" : P }}/>
        </div>
      </div>
    </div>
  );

  // ── Shared "View Selection" toggle ──
  const renderSelectionToggle = () => (
    <div className="flex-shrink-0 border-t" style={{ borderColor:"var(--pax-brd3)" }}>
      <button type="button" onClick={() => setShowPreview(p => !p)}
        className="w-full flex items-center justify-center gap-2.5 px-6 py-3 border-0 font-semibold text-[0.9375rem] cursor-pointer"
        style={{ background:"var(--pax-muted)", color:"var(--pax-t2)" }}>
        <span className="rounded-full px-2 py-px text-[0.8125rem] font-bold" style={{ background:P, color:"#fff" }}>{totalSelected}</span>
        {showPreview ? "Hide" : "View"} Selection
        <IChevD rot={showPreview} size={16} sw={2}/>
      </button>
      {showPreview && (
        <div className="max-h-[30vh] overflow-y-auto px-6 py-3.5 border-t" style={{ borderColor:"var(--pax-brd3)", background:"var(--pax-card)" }}>
          {Object.keys(preview).length === 0
            ? <p className="text-center m-0 py-4 text-sm" style={{ color:"var(--pax-t4)" }}>No items selected yet</p>
            : Object.entries(preview).map(([catName, items]) => (
              <div key={catName} className="mb-3.5">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] m-0 mb-2" style={{ color:"var(--pax-t4)" }}>{catName}</p>
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.food_type === 1 ? "#16A34A" : "#DC2626" }}/>
                    <span className="text-sm" style={{ color:"var(--pax-t2)" }}>{item.item_name}</span>
                  </div>
                ))}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );

  // ── Shared action bar ──
  const renderActionBar = () => (
    <div className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t" style={{ borderColor:"var(--pax-brd3)", background:"var(--pax-card)" }}>
      <BtnSecondary type="button" onClick={onCancel}>Cancel</BtnSecondary>
      <BtnPrimary type="button" onClick={onConfirm} disabled={!allOk}>
        {allOk ? "Confirm Selection" : `${categories.length - done} categor${categories.length - done === 1 ? "y" : "ies"} remaining`}
      </BtnPrimary>
    </div>
  );

  // ── Mobile: bottom-sheet (same pattern as CustomMenuModal) ──
  if (isMobile) return (
    <div className="fixed inset-0 flex items-end z-[10000] backdrop-blur-sm" style={{ background:"rgba(15,15,15,0.6)" }}>
      <div className="pax-sheet flex flex-col w-full rounded-t-3xl max-h-[92vh]" style={{ background:"var(--pax-card)" }}>
        {renderHeader(true)}
        <div className="flex-1 overflow-y-auto px-5 py-4">{renderAccordion()}</div>
        {renderSelectionToggle()}
        {renderActionBar()}
      </div>
    </div>
  );

  // ── Desktop: centered two-column modal ──
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm" style={{ background:"rgba(15,15,15,0.6)" }}>
      <div className="pax-modal flex flex-col w-[95%] h-[86vh] overflow-hidden rounded-3xl shadow-2xl" style={{ background:"var(--pax-card)", maxWidth:"1200px" }}>
        <div className="grid flex-1 min-h-0 overflow-hidden" style={{ gridTemplateColumns:"1.5fr 1fr" }}>
          {/* Left panel */}
          <div className="flex flex-col overflow-hidden border-r" style={{ borderColor:"var(--pax-brd3)" }}>
            {renderHeader()}
            <div className="flex-1 overflow-y-auto px-7 py-5">{renderAccordion()}</div>
          </div>
          {/* Right preview */}
          <div className="flex flex-col overflow-hidden" style={{ background:"var(--pax-muted)" }}>
            <div className="flex-shrink-0 px-7 py-6 border-b" style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd3)" }}>
              <p className="font-extrabold text-base m-0" style={{ color:"var(--pax-t1)" }}>Menu Preview</p>
              <p className="text-[0.8125rem] m-0 mt-1" style={{ color:"var(--pax-t4)" }}>{totalSelected} items selected</p>
            </div>
            {Object.keys(preview).length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background:"var(--pax-muted2)" }}>
                  <IUtensils size={20} color="#D1D5DB" sw={1.5}/>
                </div>
                <p className="font-semibold m-0 mb-1" style={{ color:"var(--pax-t3)" }}>Nothing here yet</p>
                <p className="text-[0.8125rem] m-0" style={{ color:"var(--pax-t4)" }}>Your menu will appear as you select items</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                {Object.entries(preview).map(([catName, items]) => (
                  <div key={catName} className="rounded-xl px-4 py-4 border" style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd3)" }}>
                    <p className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] m-0 mb-3" style={{ color:"var(--pax-t4)" }}>{catName}</p>
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-2 py-1">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.food_type === 1 ? "#16A34A" : "#DC2626" }}/>
                        <span className="text-sm" style={{ color:"var(--pax-t2)" }}>{item.item_name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {renderActionBar()}
      </div>
    </div>
  );
}

// ─── CustomMenuModal ──────────────────────────────────────────────────────────
function CustomMenuModal({ menuCategories, menuItems, selected, setSelected, onClose, onConfirm, isMobile }) {
  useLockScroll(onClose);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [activeCat, setActiveCat] = useState(null);
  const [showSel,  setShowSel]  = useState(false);

  const visible = useMemo(() => {
    let items = activeCat ? (menuItems || []).filter(i => i.category_id === activeCat) : (menuItems || []);
    if (filter === "veg")    items = items.filter(i => i.food_type === 1);
    if (filter === "nonveg") items = items.filter(i => i.food_type !== 1);
    if (search) items = items.filter(i => i.item_name?.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [menuItems, activeCat, filter, search]);

  const toggle  = item => setSelected(p => p.some(i => i.id === item.id) ? p.filter(i => i.id !== item.id) : [...p, item]);
  const grpSel  = useMemo(() => {
    const m = {};
    selected.forEach(i => { const c = i.category_name || "Other"; if (!m[c]) m[c] = []; m[c].push(i); });
    return m;
  }, [selected]);

  const FilterPill = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full border text-[0.8125rem] cursor-pointer whitespace-nowrap flex-shrink-0 transition-all"
      style={{
        borderColor: active ? P : "var(--pax-brd)",
        background:  active ? "var(--pax-pll)" : "var(--pax-card)",
        color:       active ? P : "var(--pax-t2)",
        fontWeight:  active ? 700 : 500,
      }}
    >
      {children}
    </button>
  );

  const FiltersBar = () => (
    <div className="flex-shrink-0 flex flex-col gap-3 px-6 py-3.5 border-b" style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd3)" }}>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex pointer-events-none" style={{ color:"var(--pax-t4)" }}>
          <ISearch size={16} sw={2}/>
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search menu items..."
          className="pax-input w-full h-[42px] rounded-xl text-sm border-[1.5px] focus:outline-none"
          style={{ paddingLeft:"42px", paddingRight:"14px", color:"var(--pax-t1)", background:"var(--pax-card)", borderColor:"var(--pax-brd)", fontFamily:"inherit" }}
        />
      </div>
      <div className="relative">
        <div className="flex gap-1.5 overflow-x-auto pb-px scrollbar-none" style={{ scrollbarWidth:"none", msOverflowStyle:"none" }}>
          <FilterPill active={filter === "all"}    onClick={() => setFilter("all")}>All</FilterPill>
          <FilterPill active={filter === "veg"}    onClick={() => setFilter("veg")}>Veg</FilterPill>
          <FilterPill active={filter === "nonveg"} onClick={() => setFilter("nonveg")}>Non-Veg</FilterPill>
          <div className="w-px flex-shrink-0 mx-0.5" style={{ background:"var(--pax-brd)" }}/>
          <FilterPill active={activeCat === null} onClick={() => setActiveCat(null)}>All Courses</FilterPill>
          {(menuCategories || []).map(cat => (
            <FilterPill key={cat.id} active={activeCat === cat.id} onClick={() => setActiveCat(cat.id)}>
              {cat.name}
            </FilterPill>
          ))}
          <div className="w-6 flex-shrink-0"/>
        </div>
        {/* Right fade + arrow hint */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none" style={{ width:"48px", background:"linear-gradient(to right, transparent, var(--pax-card) 70%)" }}>
          <svg className="absolute right-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pax-t4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>
  );

  const ItemsGrid = () => (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {visible.length === 0 ? (
        <div className="text-center py-12">
          <ISearch size={28} color="#D1D5DB" sw={1.5}/>
          <p className="font-semibold mt-3 mb-1 m-0" style={{ color:"var(--pax-t3)" }}>No items found</p>
          <p className="text-sm m-0" style={{ color:"var(--pax-t4)" }}>Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid gap-2.5" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))" }}>
          {visible.map(item => {
            const isSel = selected.some(i => i.id === item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggle(item)}
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl cursor-pointer border transition-all hover:shadow-sm"
                style={{ borderColor: isSel ? P : "var(--pax-brd)", background: isSel ? "var(--pax-pll)" : "var(--pax-card)" }}
              >
                <input type="checkbox" checked={isSel} readOnly className="w-3.5 h-3.5 flex-shrink-0 pointer-events-none" style={{ accentColor:P }}/>
                <span className="flex-1 text-[0.9375rem]" style={{ color: isSel ? P : "var(--pax-t1)", fontWeight: isSel ? 600 : 400 }}>
                  {item.item_name}
                </span>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.food_type === 1 ? "#16A34A" : "#DC2626" }}/>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const SelectionPanel = () => (
    <div className="flex flex-col overflow-hidden border-l" style={{ background:"var(--pax-muted)", borderColor:"var(--pax-brd3)" }}>
      <div className="flex-shrink-0 flex justify-between items-center px-6 py-5 border-b" style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd3)" }}>
        <p className="font-extrabold text-base m-0" style={{ color:"var(--pax-t1)" }}>Your Selection</p>
        <span className="text-[0.8125rem] font-medium px-2.5 py-0.5 rounded-full border" style={{ color:"var(--pax-t2)", background:"var(--pax-muted2)", borderColor:"var(--pax-brd3)" }}>
          {selected.length} items
        </span>
      </div>
      {selected.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <IUtensils size={24} color="#D1D5DB" sw={1.5}/>
          <p className="font-semibold mt-3 mb-1 m-0" style={{ color:"var(--pax-t3)" }}>Nothing selected</p>
          <p className="text-[0.8125rem] m-0" style={{ color:"var(--pax-t4)" }}>Click items on the left to add them</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {Object.entries(grpSel).map(([cat, items]) => (
            <div key={cat} className="mb-5">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] m-0 mb-2.5" style={{ color:"var(--pax-t4)" }}>{cat}</p>
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2 px-2.5 py-2 rounded-xl mb-1.5 border" style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd3)" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.food_type === 1 ? "#16A34A" : "#DC2626" }}/>
                  <span className="flex-1 text-sm font-medium" style={{ color:"var(--pax-t2)" }}>{item.item_name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item.item_name}`}
                    onClick={() => toggle(item)}
                    className="flex items-center p-0.5 rounded-md border-0 bg-transparent cursor-pointer transition-colors hover:text-red-500"
                    style={{ color:"var(--pax-t4)" }}
                  >
                    <IClose size={13} sw={2}/>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="flex-shrink-0 px-6 py-4 border-t flex flex-col gap-3" style={{ borderColor:"var(--pax-brd3)", background:"var(--pax-card)" }}>
        <InfoBanner color="blue">
          <span className="text-[0.8125rem]">Custom menu pricing will be quoted separately by the venue.</span>
        </InfoBanner>
        <BtnPrimary type="button" onClick={onConfirm} style={{ width:"100%" }}>
          Confirm Selection ({selected.length})
        </BtnPrimary>
      </div>
    </div>
  );

  if (isMobile) return (
    <div className="fixed inset-0 flex items-end z-[10000] backdrop-blur-sm" style={{ background:"rgba(15,15,15,0.6)" }}>
      <div className="pax-sheet flex flex-col w-full rounded-t-3xl max-h-[95vh]" style={{ background:"var(--pax-card)" }}>
        <div className="flex-shrink-0 flex justify-between items-center px-6 py-5 border-b" style={{ borderColor:"var(--pax-brd3)" }}>
          <div>
            <p className="font-extrabold text-lg m-0" style={{ color:"var(--pax-t1)" }}>Custom Menu</p>
            <p className="text-[0.8125rem] m-0 mt-0.5" style={{ color:"var(--pax-t4)" }}>{selected.length} items selected</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer border hover:bg-[var(--pax-muted2)]"
            style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd)" }}>
            <IClose size={16} sw={2}/>
          </button>
        </div>
        <FiltersBar/>
        <ItemsGrid/>
        <div className="flex-shrink-0 border-t-2" style={{ borderColor:"var(--pax-brd3)" }}>
          <button
            type="button"
            onClick={() => setShowSel(p => !p)}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-0 font-semibold cursor-pointer text-[0.9375rem]"
            style={{ background:"var(--pax-muted)", color:"var(--pax-t2)" }}
          >
            <span className="rounded-full px-2 py-px text-[0.8125rem] font-bold" style={{ background:P, color:"#fff" }}>{selected.length}</span>
            {showSel ? "Hide" : "View"} Selection <IChevD rot={showSel} size={16} sw={2}/>
          </button>
          {showSel && (
            <div className="max-h-[35vh] overflow-y-auto px-6 py-3.5 border-t" style={{ borderColor:"var(--pax-brd3)" }}>
              {selected.length === 0
                ? <p className="text-center m-0 py-4" style={{ color:"var(--pax-t4)" }}>No items selected yet</p>
                : Object.entries(grpSel).map(([cat, items]) => (
                  <div key={cat} className="mb-3.5">
                    <p className="text-[0.6875rem] font-bold uppercase tracking-[0.05em] m-0 mb-2" style={{ color:"var(--pax-t4)" }}>{cat}</p>
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-2 py-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.food_type === 1 ? "#16A34A" : "#DC2626" }}/>
                        <span className="flex-1 text-sm" style={{ color:"var(--pax-t2)" }}>{item.item_name}</span>
                        <button type="button" onClick={() => toggle(item)} className="flex border-0 bg-transparent cursor-pointer hover:text-red-500 transition-colors" style={{ color:"var(--pax-t4)" }}>
                          <IClose size={13} sw={2}/>
                        </button>
                      </div>
                    ))}
                  </div>
                ))
              }
            </div>
          )}
          <div className="px-6 py-3.5 pb-5">
            <BtnPrimary type="button" onClick={onConfirm} style={{ width:"100%" }}>
              Confirm Selection ({selected.length})
            </BtnPrimary>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm" style={{ background:"rgba(15,15,15,0.6)" }}>
      <div
        className="pax-modal grid w-[95%] h-[85vh] overflow-hidden rounded-3xl shadow-2xl"
        style={{ background:"var(--pax-card)", maxWidth:"1400px", gridTemplateColumns:"1fr 380px" }}
      >
        <div className="flex flex-col overflow-hidden">
          <div className="flex-shrink-0 px-7 py-6 border-b" style={{ borderColor:"var(--pax-brd3)" }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.06em] m-0 mb-1" style={{ color:P }}>Custom Menu</p>
                <h2 className="font-extrabold text-xl m-0" style={{ color:"var(--pax-t1)" }}>Build Your Menu</h2>
              </div>
              <button type="button" onClick={onClose} aria-label="Close"
                className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer border hover:bg-[var(--pax-muted2)]"
                style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd)", color:"var(--pax-t3)" }}>
                <IClose size={16} sw={2}/>
              </button>
            </div>
          </div>
          <FiltersBar/>
          <ItemsGrid/>
        </div>
        <SelectionPanel/>
      </div>
    </div>
  );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  useLockScroll(onCancel);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[10001] p-4 backdrop-blur-sm" style={{ background:"rgba(15,15,15,0.6)" }}>
      <div className="pax-modal rounded-2xl p-8 w-full shadow-2xl" style={{ background:"var(--pax-card)", maxWidth:"420px" }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5 border border-[#FDE68A] bg-[#FFFBEB]">
          <IWarn size={22} color="#D97706" sw={2}/>
        </div>
        <h3 className="font-extrabold text-xl text-center m-0 mb-2.5" style={{ color:"var(--pax-t1)" }}>{title}</h3>
        <p className="text-center text-[0.9375rem] leading-relaxed m-0 mb-7" style={{ color:"var(--pax-t3)" }}>{message}</p>
        <div className="flex gap-3">
          <BtnSecondary type="button" onClick={onCancel} style={{ flex:1 }}>Cancel</BtnSecondary>
          <BtnPrimary   type="button" onClick={onConfirm} style={{ flex:1 }}>Confirm</BtnPrimary>
        </div>
      </div>
    </div>
  );
}

// ─── SuccessModal ─────────────────────────────────────────────────────────────
function SuccessModal({ refNum, onClose }) {
  useLockScroll(onClose);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[10002] p-4 backdrop-blur-sm" style={{ background:"rgba(15,15,15,0.6)" }}>
      <div className="pax-modal text-center rounded-3xl px-8 py-10 w-full shadow-2xl" style={{ background:"var(--pax-card)", maxWidth:"30rem" }}>
        <div className="pax-pop w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#A7F3D0] bg-[#ECFDF5]">
          <ICheckCirc size={40} color="#059669" sw={2}/>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.08em] m-0 mb-2 text-[#059669]">Enquiry Submitted</p>
        <h2 className="text-[1.625rem] font-extrabold m-0 mb-3" style={{ color:"var(--pax-t1)" }}>You are all set!</h2>
        <p className="text-[0.9375rem] leading-relaxed m-0 mb-7" style={{ color:"var(--pax-t3)" }}>
          Our venue team will review your enquiry and send a detailed quote within 24 hours.
        </p>
        {refNum && (
          <div className="rounded-xl px-5 py-4 mb-6 border" style={{ background:"var(--pax-muted)", borderColor:"var(--pax-brd3)" }}>
            <p className="text-xs font-bold uppercase tracking-[0.06em] m-0 mb-1.5" style={{ color:"var(--pax-t4)" }}>Reference Number</p>
            <p className="text-[1.375rem] font-bold m-0" style={{ color:"var(--pax-t1)", fontFamily:"Courier New, monospace", letterSpacing:"0.05em" }}>{refNum}</p>
          </div>
        )}
        <div className="flex gap-2 items-start text-left rounded-xl px-4 py-3.5 mb-6 border border-[#BBF7D0] bg-[#F0FDF4]">
          <span className="flex-shrink-0 flex mt-px"><ICheckCirc size={16} color="#059669" sw={2}/></span>
          <p className="text-sm leading-relaxed m-0 text-[#065F46]">
            A confirmation has been logged. Our team will reach out within 24 hours with a detailed quote tailored to your requirements.
          </p>
        </div>
        <BtnPrimary type="button" onClick={onClose} style={{ width:"100%", justifyContent:"center" }}>
          Back to Home
        </BtnPrimary>
      </div>
    </div>
  );
}

// ─── MobileBottomBar ──────────────────────────────────────────────────────────
function MobileBottomBar({ pricing, showPanel, onToggle, ctx, coverImage, selectedPackage, menuTab, customMenuItems, adultCount, childCount, bookingEventType, setBookingEventType, bookingDate, setBookingDate, bookingShift, setBookingShift, venueshifts, onOpenDateModal, onOpenGuestsModal }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t" style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd3)" }}>
      {showPanel && (
        <div className="pax-sheet max-h-[75vh] overflow-y-auto" style={{ borderColor:"var(--pax-brd2)" }}>
          <div className="sticky top-0 flex justify-between items-center px-5 py-4 border-b" style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd3)", zIndex:1 }}>
            <p className="font-bold m-0" style={{ color:"var(--pax-t1)" }}>Summary</p>
            <button type="button" onClick={onToggle} className="flex border-0 bg-transparent cursor-pointer" style={{ color:"var(--pax-t3)" }}>
              <IClose size={18} sw={2}/>
            </button>
          </div>
          <SummaryCard
            pricing={pricing}
            ctx={ctx}
            coverImage={coverImage}
            selectedPackage={selectedPackage}
            menuTab={menuTab}
            customMenuItems={customMenuItems}
            adultCount={adultCount}
            childCount={childCount}
            bookingEventType={bookingEventType}
            setBookingEventType={setBookingEventType}
            bookingDate={bookingDate}
            setBookingDate={setBookingDate}
            bookingShift={bookingShift}
            setBookingShift={setBookingShift}
            venueshifts={venueshifts}
            onOpenDateModal={onOpenDateModal}
            onOpenGuestsModal={onOpenGuestsModal}
            flat
          />
        </div>
      )}
      {!showPanel && (
        <div className="flex items-center justify-between px-5 py-3.5">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.04em] m-0 mb-0.5" style={{ color:"var(--pax-t4)" }}>Estimated Total</p>
            <p className="text-lg font-bold m-0" style={{ color:"var(--pax-t1)" }}>
              {pricing.total > 0 ? fmt(pricing.total) : <span className="text-sm font-medium" style={{ color:"var(--pax-t4)" }}>Select menu &amp; guests</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm cursor-pointer border transition-all"
            style={{ background:"transparent", borderColor:"var(--pax-brd)", color:"var(--pax-t2)" }}
          >
            View Details <IChevD rot={false} size={15} sw={2}/>
          </button>
        </div>
      )}
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaxEnquiryPage() {
  const params       = useParams();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const locale  = params?.locale  ?? "en";
  const country = params?.country ?? "in";
  const venueId = params?.id      ?? "";

  const token = searchParams.get("token");

  const [tokenError, setTokenError] = useState(false);
const [catalogError,    setCatalogError]    = useState("");
  // Holds the *unwrapped* payload returned by verify_checkout_token,
  // i.e. { eventType, date, shift, guests, venueName, venueId, ... }
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    if (!token) return;

    verifyToken(token);
     loadPax();
  }, [token]);

  const verifyToken = async (token) => {
    try {
      const res = await verify_checkout_token({ token: token });
      // res.data.data is the actual booking payload — do NOT re-wrap it in
      // another `.data` when reading fields from checkoutData below.
      setCheckoutData(res.data.data);
    } catch (err) {
      console.error("Token verification failed:", err);
      setTokenError(true);
    }
  };

    // ── catalogue (packages + menu categories/items) ──────────────────────────────
  const loadPax = useCallback(async () => {
    setLoadingPackages(true);
    setCatalogError("");
    try {
      const res = await loadPackage(venueId);
      const { categories, items, packages } = normalizeCatalog(res?.data);
      setMenuCategories(categories);
      setMenuItems(items);
      setPackagesList(packages);
      // No preset packages for this venue yet — send guests straight to the
      // custom menu builder instead of an empty "Preset Packages" tab.
      if (packages.length === 0) setMenuTab("custom");
    } catch (err) {
      console.error("Failed to load menu catalogue:", err);
      setCatalogError("We couldn't load the menu for this venue. Please try again.");
    } finally {
      setLoadingPackages(false);
    }
  }, [venueId]);

  useEffect(() => {
    loadPax();
  }, [loadPax]);

  const ctx = useMemo(() => ({
    eventType:       checkoutData?.eventType,
    date:            checkoutData?.date,
    shift:           checkoutData?.shift,
    guests:          Number(checkoutData?.guests || 0),
    venueName:       checkoutData?.venueName,
    parentVenueName: searchParams.get("parentVenueName") ?? "",
    venueImage:      searchParams.get("venueImage")      ?? "",
    venueRating:     searchParams.get("venueRating")     ?? "4.5",
    venueAddress:    searchParams.get("venueAddress")    ?? "",
    venueId:         checkoutData?.venueId,
  }), [checkoutData, searchParams]);

  // ── State ───────────────────────────────────────────────────────────────────
  const [step,            setStep]            = useState(1);
  const [menuTab,         setMenuTab]         = useState("packages");
  const [adultCount,      setAdultCount]      = useState(ctx.guests || 0);
  const [childCount,      setChildCount]      = useState(0);
  const [packagesList,    setPackagesList]    = useState([]);
  const [menuCategories,  setMenuCategories]  = useState([]);
  const [menuItems,       setMenuItems]       = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [venueImages,     setVenueImages]     = useState([]);
  const [venueshifts,     setVenueshifts]     = useState([]);
  // FIX (bug #2 — availability): real booking data for PremiumCalendar,
  // fetched from the venue API instead of being hardcoded to {}/[]/[].
  const [venueBookingData,    setVenueBookingData]    = useState({});
  const [venueBookingFull,    setVenueBookingFull]    = useState([]);
  const [venueBookingParial,  setVenueBookingParial]  = useState([]);
  const [bookingEventType, setBookingEventType] = useState(ctx.eventType);
  const [bookingDate,      setBookingDate]      = useState(ctx.date);
  const [bookingShift,     setBookingShift]     = useState(ctx.shift);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [pkgSelections,   setPkgSelections]   = useState({});
  const [customMenuItems, setCustomMenuItems] = useState([]);
  const [dietary,      setDietary]      = useState({});
  const [allergies,    setAllergies]    = useState({});
  const [otherAllergy, setOtherAllergy] = useState("");
  const [servingPref,  setServingPref]  = useState("");
  const [notes,        setNotes]        = useState("");
  const [contactName,  setContactName]  = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactOrg,   setContactOrg]   = useState("");
  const [errors,       setErrors]       = useState({});
  const [showPkgModal,    setShowPkgModal]    = useState(false);
  const [pendingPkg,      setPendingPkg]      = useState(null);
  const [tempPkgSel,      setTempPkgSel]      = useState({});
  const [initPkgSel,      setInitPkgSel]      = useState({});
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showDateModal,   setShowDateModal]   = useState(false);
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [tempCustomItems, setTempCustomItems] = useState([]);
  const [confirm,         setConfirm]         = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [enquiryRef,  setEnquiryRef]  = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [hasDraft,        setHasDraft]        = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [isMobile,        setIsMobile]        = useState(false);

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Token verification resolves asynchronously, after the initial render has
  // already set adultCount / bookingEventType / bookingDate / bookingShift
  // from an empty ctx. Re-sync those fields once real checkout data arrives,
  // but only if the user hasn't already started editing them.
  useEffect(() => {
    if (!checkoutData) return;
    setAdultCount(prev => (prev === 0 ? (ctx.guests || 0) : prev));
    setBookingEventType(prev => prev ?? ctx.eventType);
    setBookingDate(prev => prev ?? ctx.date);
    setBookingShift(prev => prev ?? ctx.shift);
  }, [checkoutData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try { const r = localStorage.getItem(DRAFT_KEY); if (r) { const d = JSON.parse(r); if (d.venueId === venueId) setHasDraft(true); } } catch {}
  }, [venueId]);

  useEffect(() => {
    try { const p = JSON.parse(localStorage.getItem("userProfile") || "{}"); if (p.name) setContactName(p.name); if (p.email) setContactEmail(p.email); if (p.phone) setContactPhone(p.phone); } catch {}
  }, []);

  // FIX (bug #3 — "package / item not loading dynamically"):
  // This previously called loadMockData(), which always returns the
  // hardcoded MOCK_PACKAGES / MOCK_CATEGORIES / MOCK_ITEMS regardless of
  // venueId — so the menu never actually varied per venue. It's merged
  // here with the venue-details fetch (gallery/shifts/availability) so
  // there's a single real API call per venueId, and mock data is now only
  // used as a fallback if the API returns nothing for that venue.
  //
  // NOTE: adjust the field names below (`res.data.packages`,
  // `res.data.categories`/`menuCategories`, `res.data.items`/`menuItems`,
  // `res.data.bookingData`, `res.data.bookingFull`, `res.data.bookingPartial`)
  // to match whatever loadVenues() actually returns from your backend. If
  // packages/menu come from a separate endpoint/service, swap that call in
  // here instead.
  useEffect(() => {
    if (!venueId) return;
    let cancelled = false;
    setLoadingPackages(true);

    loadVenues(venueId).then(res => {
      if (cancelled) return;
      const d = res?.data || {};

      if (d.gallery?.length) setVenueImages(d.gallery);
      if (d.shifts?.length)  setVenueshifts(d.shifts);

      // Availability for the calendar
      setVenueBookingData(d.bookingData || d.booking_data || {});
      setVenueBookingFull(d.bookingFull || d.booking_full || d.fullyBookedDates || []);
      setVenueBookingParial(d.bookingParial || d.bookingPartial || d.booking_partial || d.partiallyBookedDates || []);

      // Packages / menu — fall back to mock data only if the API has
      // nothing for this venue, so the UI never renders completely empty.
      const packages   = d.packages || d.pax_packages || [];
      const categories = d.categories || d.menuCategories || d.menu_categories || [];
      const items      = d.items || d.menuItems || d.menu_items || [];

      // setPackagesList(packages.length   ? packages   : MOCK_PACKAGES);
      // setMenuCategories(categories.length ? categories : MOCK_CATEGORIES);
      // setMenuItems(items.length         ? items       : MOCK_ITEMS);
    }).catch(err => {
      console.error("Failed to load venue menu/availability data:", err);
      if (!cancelled) {
        // Fall back to mock data so the enquiry flow is still usable.
        // setPackagesList(MOCK_PACKAGES);
        // setMenuCategories(MOCK_CATEGORIES);
        // setMenuItems(MOCK_ITEMS);
      }
    }).finally(() => { if (!cancelled) setLoadingPackages(false); });

    return () => { cancelled = true; };
  }, [venueId]);

  // ── Pricing ─────────────────────────────────────────────────────────────────
const pricing = useMemo(() => {
  let foodTotal = 0, foodDesc = "";
  if (menuTab === "packages" && selectedPackage) {
    foodTotal = (selectedPackage.package_amount || 0) * adultCount;
    foodDesc  = `${selectedPackage.package_name} × ${adultCount} persons`;
  } else if (menuTab === "custom" && customMenuItems.length > 0) {
    const perPersonTotal = customMenuItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
    foodTotal = perPersonTotal * adultCount;
    foodDesc  = `Custom Menu (${customMenuItems.length} items) × ${adultCount} persons`;
  }
  const guestCount    = adultCount + childCount;
  const addonSummary  = 0;
  const minimumCharge = guestCount > 0 && guestCount < MINIMUM_PAX && foodTotal > 0
    ? (MINIMUM_PAX - guestCount) * (selectedPackage?.package_amount || 0)
    : 0;
  const subtotal = foodTotal + addonSummary + minimumCharge;
  const tax5     = foodTotal * FOOD_TAX;
  const tax18    = addonSummary * ADDON_TAX;
  const total    = subtotal + tax5 + tax18;
  return { foodDesc, foodTotal, addonSummary, minimumCharge, subtotal, tax5, tax18, total };
}, [adultCount, childCount, menuTab, selectedPackage, customMenuItems]);
  // ── Draft ────────────────────────────────────────────────────────────────────
  const saveDraft = useCallback(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ venueId, step, menuTab, adultCount, childCount, selectedPackage, pkgSelections, customMenuItems, dietary, allergies, otherAllergy, servingPref, notes, contactName, contactEmail, contactPhone, contactOrg, ts: Date.now() }));
    setHasDraft(true);
  }, [venueId, step, menuTab, adultCount, childCount, selectedPackage, pkgSelections, customMenuItems, dietary, allergies, otherAllergy, servingPref, notes, contactName, contactEmail, contactPhone, contactOrg]);

  const loadDraft = () => {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
      if (!d.venueId) return;
      if (d.step)            setStep(d.step);
      if (d.menuTab)         setMenuTab(d.menuTab);
      if (d.adultCount)      setAdultCount(d.adultCount);
      if (d.childCount)      setChildCount(d.childCount);
      if (d.selectedPackage) setSelectedPackage(d.selectedPackage);
      if (d.pkgSelections)   setPkgSelections(d.pkgSelections);
      if (d.customMenuItems) setCustomMenuItems(d.customMenuItems);
      if (d.dietary)         setDietary(d.dietary);
      if (d.allergies)       setAllergies(d.allergies);
      if (d.otherAllergy)    setOtherAllergy(d.otherAllergy);
      if (d.servingPref)     setServingPref(d.servingPref);
      if (d.notes)           setNotes(d.notes);
      if (d.contactName)     setContactName(d.contactName);
      if (d.contactEmail)    setContactEmail(d.contactEmail);
      if (d.contactPhone)    setContactPhone(d.contactPhone);
      if (d.contactOrg)      setContactOrg(d.contactOrg);
      setHasDraft(false);
    } catch {}
  };
  const dismissDraft = () => { localStorage.removeItem(DRAFT_KEY); setHasDraft(false); };

  // ── Navigation ───────────────────────────────────────────────────────────────
  const validateStep = s => {
    if (s === 3) {
      const e = {};
      if (!contactName.trim())  e.name  = "Full name is required";
      if (!contactEmail.trim()) e.email = "Email address is required";
      if (!contactPhone.trim()) e.phone = "Phone number is required";
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    return true;
  };
  const goNext = () => { if (!validateStep(step)) return; setErrors({}); setStep(s => Math.min(STEPS.length, s + 1)); window.scrollTo({ top:0, behavior:"smooth" }); };
  const goBack = () => { setStep(s => Math.max(1, s - 1)); window.scrollTo({ top:0, behavior:"smooth" }); };

  // ── Tab Switch ────────────────────────────────────────────────────────────────
  const handleTabSwitch = tab => {
    if (tab === menuTab) return;
    const hasSel = menuTab === "packages" ? !!selectedPackage : customMenuItems.length > 0;
    if (hasSel) setConfirm({ title:"Switch Menu Mode?", message:"Switching will clear your current menu selection. This cannot be undone.", onConfirm:() => { setMenuTab(tab); setSelectedPackage(null); setPkgSelections({}); setCustomMenuItems([]); setConfirm(null); } });
    else setMenuTab(tab);
  };

  // ── Package Modal ─────────────────────────────────────────────────────────────
  const openPackageModal = pkg => {
    if (selectedPackage && selectedPackage.id !== pkg.id) {
      setConfirm({ title:"Switch Package?", message:`Switch to "${pkg.package_name}"? Your current customisations will be cleared.`, onConfirm:() => { setPendingPkg(pkg); setTempPkgSel({}); setShowPkgModal(true); setConfirm(null); } });
    } else {
    const init = selectedPackage?.id === pkg.id ? { ...pkgSelections } : {};
    setPendingPkg(pkg); setTempPkgSel(init); setInitPkgSel(init); setShowPkgModal(true);
  }
  };
  const confirmPkg = () => { setSelectedPackage(pendingPkg); setPkgSelections(tempPkgSel); setShowPkgModal(false); setPendingPkg(null); };
  const cancelPkg  = () => {
    const hasChanges = JSON.stringify(tempPkgSel) !== JSON.stringify(initPkgSel);
    if (hasChanges) {
      setConfirm({ title:"Discard Selection?", message:"Leave without saving your item selections?", onConfirm:() => { setShowPkgModal(false); setPendingPkg(null); setConfirm(null); } });
    } else {
      setShowPkgModal(false);
      setPendingPkg(null);
    }
  };

  // ── Custom Menu ───────────────────────────────────────────────────────────────
  const openCustomMenuModal = () => { setTempCustomItems([...customMenuItems]); setShowCustomModal(true); };
  const confirmCustom       = () => { setCustomMenuItems([...tempCustomItems]); setShowCustomModal(false); };
  const cancelCustom        = () => {
    const hasSel = tempCustomItems.length > 0;
    if (hasSel) {
      setConfirm({ title:"Discard Selection?", message:"Leave without saving your item selections?", onConfirm:() => { setShowCustomModal(false); setConfirm(null); } });
    } else {
      setShowCustomModal(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  // const handleSubmit = async () => {
  //   if (submitting) return;
  //   setSubmitting(true);
  //   const ref = genRef();
  //   try {
  //     await submitMockEnquiry({ venue_id:venueId, event_type:ctx.eventType, event_date:ctx.date, shift:ctx.shift, adult_count:adultCount, child_count:childCount, menu_mode:menuTab, package_id:selectedPackage?.id, custom_items:customMenuItems.map(i => i.id), dietary:Object.entries(dietary).filter(([,v])=>v).map(([k])=>k), allergies:Object.entries(allergies).filter(([,v])=>v).map(([k])=>k), other_allergy:otherAllergy, serving_pref:servingPref, notes, contact_name:contactName, contact_email:contactEmail, contact_phone:contactPhone, contact_org:contactOrg, _ref:ref });
  //     setEnquiryRef(ref); localStorage.removeItem(DRAFT_KEY); setShowSuccess(true);
  //   } catch (err) { console.error("PAX submit error:", err); }
  //   finally { setSubmitting(false); }
  // };
  const handleSubmit = async () => {
  if (submitting) return;

  // Validation
  if (menuTab === "packages" && !selectedPackage) {
    setCatalogError("Please select a preset package.");
    return;
  }

  if (menuTab === "custom" && customMenuItems.length === 0) {
    setCatalogError("Please select at least one menu item.");
    return;
  }

  setSubmitting(true);
  setCatalogError("");

  const ref = genRef();

  const payload = {
    venue_id: venueId,
    event_type: ctx.eventType,
    event_date: ctx.date,
    shift: ctx.shift,

    adult_count: adultCount,
    child_count: childCount,

    menu_mode: menuTab,
    package_id:   selectedPackage?.id,
    package_selections: pkgSelections,

    // package_id:
    //   menuTab === "packages" ? selectedPackage.id : null,

    custom_items:
      menuTab === "custom"
        ? customMenuItems.map((item) => item.id)
        : [], 

    dietary: Object.entries(dietary)
      .filter(([, value]) => value)
      .map(([key]) => key),

    allergies: Object.entries(allergies)
      .filter(([, value]) => value)
      .map(([key]) => key),

    other_allergy: otherAllergy,
    serving_pref: servingPref,
    notes,

    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    contact_org: contactOrg,

    estimated_total: pricing.total,
    _ref: ref,
  };

  try {
    const response = await package_booking(payload)
    setEnquiryRef(response?.data?.booking_code);
    localStorage.removeItem(DRAFT_KEY);
    setShowSuccess(true);
  } catch (err) {
    console.error(err);

    setCatalogError(
      err?.response?.data?.message ||
      "Unable to submit your enquiry. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
};
  const handleSuccessClose = () => { setShowSuccess(false); router.push(`/${locale}/${country}`); };

  // ── Render ────────────────────────────────────────────────────────────────────
  const stepTitles = ["Guests & Menu", "Requirements", "Contact Info", "Review & Submit"];
  // gallery items may be plain URL strings or objects — handle both
  const rawImg  = venueImages[0];
  const apiImg  = rawImg ? (typeof rawImg === "string" ? rawImg : rawImg?.url || rawImg?.src || rawImg?.image || rawImg?.photo || "") : "";
  const coverImage = apiImg || ctx.venueImage || null;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-[8px]" style={{ background:"var(--pax-header)", borderColor:"var(--pax-brd3)", WebkitBackdropFilter:"blur(8px)" }}>
        <div className="flex items-center h-[64px] md:h-[72px] px-5 sm:px-8 lg:px-10">
          <img src={lightLogo?.src ?? lightLogo} alt="venuebook.in" width={140} height={28} className="h-7 md:h-8 w-auto dark:hidden"/>
          <img src={darkLogo?.src ?? darkLogo}   alt="venuebook.in" width={140} height={28} className="h-7 md:h-8 w-auto hidden dark:block"/>
        </div>
      </header>

      {/* ── Draft banner ── */}
      {hasDraft && (
        <div style={{ background:"var(--pax-pll)", borderBottom:`1px solid var(--pax-pl)` }}>
          <div className="mx-auto max-w-[1280px] px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[0.9375rem] font-medium" style={{ color:P }}>
              <IInfo size={16} color={P} sw={2}/> You have a saved draft for this venue.
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <BtnPrimary  type="button" onClick={loadDraft}    style={{ height:"34px", fontSize:"0.8125rem", padding:"0 14px" }}>Load Draft</BtnPrimary>
              <BtnSecondary type="button" onClick={dismissDraft} style={{ height:"34px", fontSize:"0.8125rem", padding:"0 14px" }}>Dismiss</BtnSecondary>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <main className="mx-auto max-w-[1280px] px-4 pt-6 pb-40 lg:px-8 lg:pb-12">

        {/* Back + title row */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => step > 1 ? goBack() : router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border flex-shrink-0 transition-colors hover:bg-[var(--pax-muted2)]"
            style={{ borderColor:"var(--pax-brd)", color:"var(--pax-t2)" }}
          >
            <IChevL size={16} sw={2} color="var(--pax-t2)"/>
          </button>
          <h1 className="text-2xl font-bold m-0 leading-tight" style={{ color:"var(--pax-t1)" }}>PAX Enquiry</h1>
          <p className="text-xs m-0 ml-auto flex-shrink-0" style={{ color:"var(--pax-t4)" }}>
            Step {step} of {STEPS.length} — {STEPS.find(s => s.id === step)?.label}
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid gap-8 items-start lg:grid-cols-[1fr_380px]">

          {/* ── Left: step content ── */}
          <div className="min-w-0">
            {/* Step 1 — Guest Count + Food Menu (merged) */}
            {step === 1 && (
              <div className="pax-card flex flex-col gap-0 rounded-2xl border p-6" style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd3)" }}>
                <GuestCounter
                  adultCount={adultCount} setAdultCount={setAdultCount}
                  childCount={childCount} setChildCount={setChildCount}
                />
                <Divider className="-mx-6 my-5"/>
                <div className="flex flex-col gap-5">
                <StepFoodMenu
                  menuTab={menuTab}
                  packagesList={packagesList}
                  loadingPackages={loadingPackages}
                  selectedPackage={selectedPackage}
                  adultCount={adultCount}
                  openPackageModal={openPackageModal}
                  customMenuItems={customMenuItems}
                  openCustomMenuModal={openCustomMenuModal}
                  removeCustomItem={id => setCustomMenuItems(p => p.filter(i => i.id !== id))}
                  onSwitchTab={handleTabSwitch}
                />
                <InfoBanner color="blue">
  <span className="text-[0.8125rem]">Prices shown are per guest and scale automatically with your guest count.</span>
</InfoBanner>
                </div>
              </div>
            )}
            {/* Step 2 — Requirements */}
            {step === 2 && (
              <StepRequirements
                dietary={dietary}       setDietary={setDietary}
                allergies={allergies}   setAllergies={setAllergies}
                otherAllergy={otherAllergy} setOtherAllergy={setOtherAllergy}
                servingPref={servingPref}   setServingPref={setServingPref}
                notes={notes}           setNotes={setNotes}
              />
            )}
            {/* Step 3 — Contact */}
            {step === 3 && (
              <StepContact
                name={contactName}   setName={setContactName}
                email={contactEmail} setEmail={setContactEmail}
                phone={contactPhone} setPhone={setContactPhone}
                org={contactOrg}     setOrg={setContactOrg}
                errors={errors}
              />
            )}
            {/* Step 4 — Review */}
            {step === 4 && (
              <StepReview
                ctx={ctx}
                adultCount={adultCount} childCount={childCount}
                menuTab={menuTab}
                selectedPackage={selectedPackage}
                customMenuItems={customMenuItems}
                dietary={dietary} allergies={allergies}
                otherAllergy={otherAllergy}
                servingPref={servingPref}
                notes={notes}
                name={contactName} email={contactEmail}
                phone={contactPhone} org={contactOrg}
                pricing={pricing}
              />
            )}

            {/* ── Navigation bar ── */}
            <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t" style={{ borderColor:"var(--pax-brd3)" }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1.5 px-4 h-11 rounded-xl font-semibold text-[0.9375rem] transition-all border cursor-pointer hover:bg-[var(--pax-muted)] hover:border-[var(--pax-t4)]"
                  style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd)", color:"var(--pax-t2)" }}
                >
                  <IChevL size={16} sw={2.5} color="currentColor"/> Back
                </button>
              )}
              {step === 1 && <div/>}

              <div className="flex items-center gap-2.5">
                {step < STEPS.length && (
                  <button
                    type="button"
                    onClick={saveDraft}
                    className="flex items-center gap-1.5 px-4 h-11 rounded-xl font-semibold text-[0.9375rem] transition-all border cursor-pointer hover:bg-[var(--pax-muted)] hover:border-[var(--pax-t4)]"
                    style={{ background:"var(--pax-card)", borderColor:"var(--pax-brd)", color:"var(--pax-t2)" }}
                    aria-label="Save draft"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Save Draft
                  </button>
                )}
                {step < STEPS.length ? (
                  <BtnPrimary type="button" onClick={goNext}>
                    Continue <IArrowR size={16} color="#fff" sw={2.25}/>
                  </BtnPrimary>
                ) : (
                  <BtnPrimary type="button" onClick={handleSubmit} loading={submitting} disabled={submitting}>
                    {submitting ? "Submitting..." : <><ICheck size={16} color="#fff" sw={2.5}/> Submit Enquiry</>}
                  </BtnPrimary>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: sticky summary (desktop only) ── */}
          {!isMobile && (
            <div className="sticky top-[80px]">
              <SummaryCard
                pricing={pricing}
                ctx={ctx}
                coverImage={coverImage}
                selectedPackage={selectedPackage}
                menuTab={menuTab}
                customMenuItems={customMenuItems}
                adultCount={adultCount}
                childCount={childCount}
                setAdultCount={setAdultCount}
                setChildCount={setChildCount}
                bookingEventType={bookingEventType}
                setBookingEventType={setBookingEventType}
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
                bookingShift={bookingShift}
                setBookingShift={setBookingShift}
                venueshifts={venueshifts}
                onOpenDateModal={() => setShowDateModal(true)}
                onOpenGuestsModal={() => setShowGuestsModal(true)}
              />
            </div>
          )}
        </div>
      </main>

      {/* ── Mobile bottom price bar ── */}
      {isMobile && (
        <MobileBottomBar
          pricing={pricing}
          showPanel={showMobilePanel}
          onToggle={() => setShowMobilePanel(p => !p)}
          ctx={ctx}
          coverImage={coverImage}
          selectedPackage={selectedPackage}
          menuTab={menuTab}
          customMenuItems={customMenuItems}
          adultCount={adultCount}
          childCount={childCount}
          bookingEventType={bookingEventType}
          setBookingEventType={setBookingEventType}
          bookingDate={bookingDate}
          setBookingDate={setBookingDate}
          bookingShift={bookingShift}
          setBookingShift={setBookingShift}
          venueshifts={venueshifts}
          onOpenDateModal={() => setShowDateModal(true)}
          onOpenGuestsModal={() => setShowGuestsModal(true)}
        />
      )}

      {/* ── Modals (all at page root to clear sticky header stacking context) ── */}
      {showDateModal && (
        <ChangeDateModal
          date={bookingDate || ctx.date}
          shift={bookingShift || ctx.shift}
          venueshifts={venueshifts}
          bookingData={venueBookingData}
          bookingFull={venueBookingFull}
          bookingParial={venueBookingParial}
          onSave={(d, s) => { setBookingDate(d); setBookingShift(s); }}
          onClose={() => setShowDateModal(false)}
        />
      )}
      {showGuestsModal && (
        <ChangeGuestsModal
          adultCount={adultCount}
          childCount={childCount}
          onSave={(a, c) => { setAdultCount(a); setChildCount(c); }}
          onClose={() => setShowGuestsModal(false)}
        />
      )}
      {showPkgModal && pendingPkg && (
        <PackageModal
          pkg={pendingPkg}
          menuCategories={menuCategories}
          menuItems={menuItems}
          selections={tempPkgSel}
          setSelections={setTempPkgSel}
          onCancel={cancelPkg}
          onConfirm={confirmPkg}
          isMobile={isMobile}
        />
      )}
      {showCustomModal && (
        <CustomMenuModal
          menuCategories={menuCategories}
          menuItems={menuItems}
          selected={tempCustomItems}
          setSelected={setTempCustomItems}
          onClose={cancelCustom}
          onConfirm={confirmCustom}
          isMobile={isMobile}
        />
      )}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {showSuccess && (
        <SuccessModal refNum={enquiryRef} onClose={handleSuccessClose}/>
      )}
    </>
  );
}