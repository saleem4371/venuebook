"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CATEGORIES = [
  { id: 1, name: "Starters & Soups" },
  { id: 2, name: "Main Course" },
  { id: 3, name: "Breads & Rice" },
  { id: 4, name: "Desserts" },
  { id: 5, name: "Beverages" },
];

const MOCK_ITEMS = [
  // Starters & Soups (cat 1)
  { id: 101, category_id: 1, category_name: "Starters & Soups", item_name: "Veg Spring Rolls", food_type: 1 },
  { id: 102, category_id: 1, category_name: "Starters & Soups", item_name: "Paneer Tikka", food_type: 1 },
  { id: 103, category_id: 1, category_name: "Starters & Soups", item_name: "Hara Bhara Kebab", food_type: 1 },
  { id: 104, category_id: 1, category_name: "Starters & Soups", item_name: "Tomato Soup", food_type: 1 },
  { id: 105, category_id: 1, category_name: "Starters & Soups", item_name: "Chicken Tikka", food_type: 2 },
  { id: 106, category_id: 1, category_name: "Starters & Soups", item_name: "Seekh Kebab", food_type: 2 },
  { id: 107, category_id: 1, category_name: "Starters & Soups", item_name: "Chicken Soup", food_type: 2 },
  // Main Course (cat 2)
  { id: 201, category_id: 2, category_name: "Main Course", item_name: "Paneer Butter Masala", food_type: 1 },
  { id: 202, category_id: 2, category_name: "Main Course", item_name: "Dal Makhani", food_type: 1 },
  { id: 203, category_id: 2, category_name: "Main Course", item_name: "Veg Biryani", food_type: 1 },
  { id: 204, category_id: 2, category_name: "Main Course", item_name: "Mix Veg Curry", food_type: 1 },
  { id: 205, category_id: 2, category_name: "Main Course", item_name: "Kadai Paneer", food_type: 1 },
  { id: 206, category_id: 2, category_name: "Main Course", item_name: "Chicken Biryani", food_type: 2 },
  { id: 207, category_id: 2, category_name: "Main Course", item_name: "Butter Chicken", food_type: 2 },
  { id: 208, category_id: 2, category_name: "Main Course", item_name: "Mutton Rogan Josh", food_type: 2 },
  // Breads & Rice (cat 3)
  { id: 301, category_id: 3, category_name: "Breads & Rice", item_name: "Butter Naan", food_type: 1 },
  { id: 302, category_id: 3, category_name: "Breads & Rice", item_name: "Tandoori Roti", food_type: 1 },
  { id: 303, category_id: 3, category_name: "Breads & Rice", item_name: "Laccha Paratha", food_type: 1 },
  { id: 304, category_id: 3, category_name: "Breads & Rice", item_name: "Steamed Rice", food_type: 1 },
  { id: 305, category_id: 3, category_name: "Breads & Rice", item_name: "Jeera Rice", food_type: 1 },
  // Desserts (cat 4)
  { id: 401, category_id: 4, category_name: "Desserts", item_name: "Gulab Jamun", food_type: 1 },
  { id: 402, category_id: 4, category_name: "Desserts", item_name: "Rasgulla", food_type: 1 },
  { id: 403, category_id: 4, category_name: "Desserts", item_name: "Kheer", food_type: 1 },
  { id: 404, category_id: 4, category_name: "Desserts", item_name: "Ice Cream (2 flavours)", food_type: 1 },
  { id: 405, category_id: 4, category_name: "Desserts", item_name: "Fruit Custard", food_type: 1 },
  // Beverages (cat 5)
  { id: 501, category_id: 5, category_name: "Beverages", item_name: "Welcome Drink (Mocktail)", food_type: 1 },
  { id: 502, category_id: 5, category_name: "Beverages", item_name: "Fresh Lime Soda", food_type: 1 },
  { id: 503, category_id: 5, category_name: "Beverages", item_name: "Masala Chai", food_type: 1 },
  { id: 504, category_id: 5, category_name: "Beverages", item_name: "Filter Coffee", food_type: 1 },
  { id: 505, category_id: 5, category_name: "Beverages", item_name: "Soft Drinks Assorted", food_type: 1 },
];

const MOCK_PACKAGES = [
  {
    id: "pkg_silver",
    package_name: "Silver Banquet",
    package_amount: 850,
    package_food_type: 1,
    is_popular: false,
    categories: [
      { id: 1, name: "Starters & Soups" },
      { id: 3, name: "Breads & Rice" },
      { id: 4, name: "Desserts" },
    ],
  },
  {
    id: "pkg_gold",
    package_name: "Gold Feast",
    package_amount: 1200,
    package_food_type: 1,
    is_popular: true,
    categories: [
      { id: 1, name: "Starters & Soups" },
      { id: 2, name: "Main Course" },
      { id: 3, name: "Breads & Rice" },
      { id: 4, name: "Desserts" },
    ],
  },
  {
    id: "pkg_platinum",
    package_name: "Platinum Grand",
    package_amount: 1800,
    package_food_type: 1,
    is_popular: false,
    categories: MOCK_CATEGORIES,
  },
  {
    id: "pkg_nonveg",
    package_name: "Non-Veg Special",
    package_amount: 1500,
    package_food_type: 2,
    is_popular: false,
    categories: [
      { id: 1, name: "Starters & Soups" },
      { id: 2, name: "Main Course" },
      { id: 3, name: "Breads & Rice" },
      { id: 4, name: "Desserts" },
      { id: 5, name: "Beverages" },
    ],
  },
  {
    id: "pkg_budget",
    package_name: "Budget Bliss",
    package_amount: 650,
    package_food_type: 1,
    is_popular: false,
    categories: [
      { id: 2, name: "Main Course" },
      { id: 3, name: "Breads & Rice" },
    ],
  },
];

// Simulate async load with 600ms delay
function loadMockData() {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ packages: MOCK_PACKAGES, categories: MOCK_CATEGORIES, items: MOCK_ITEMS }), 600)
  );
}

function submitMockEnquiry(payload) {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true, ref: payload._ref }), 1200));
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Event Details", short: "Details" },
  { id: 2, label: "Food Menu",     short: "Menu"    },
  { id: 3, label: "Requirements",  short: "Reqs"    },
  { id: 4, label: "Contact Info",  short: "Contact" },
  { id: 5, label: "Review",        short: "Review"  },
];
const DIETARY_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian" }, { id: "vegan",     label: "Vegan"       },
  { id: "glutenFree", label: "Gluten-Free"}, { id: "dairyFree", label: "Dairy-Free"  },
  { id: "halal",      label: "Halal"      }, { id: "kosher",    label: "Kosher"      },
];
const ALLERGY_OPTIONS = [
  { id: "nuts",     label: "Nuts"     }, { id: "shellfish", label: "Shellfish" },
  { id: "dairy",    label: "Dairy"    }, { id: "eggs",      label: "Eggs"      },
  { id: "soy",      label: "Soy"      }, { id: "wheat",     label: "Wheat"     },
  { id: "fish",     label: "Fish"     }, { id: "other",     label: "Other"     },
];
const SERVING_PREFS = ["Buffet", "Plated", "Family Style", "Stations"];
const MINIMUM_PAX   = 50;
const FOOD_TAX      = 0.05;
const ADDON_TAX     = 0.18;
const DRAFT_KEY     = "paxBookingDraft";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
}
function fmtDate(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
  catch { return d; }
}
function genRef() { return "VB-PAX-" + Math.random().toString(36).substring(2, 8).toUpperCase(); }

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChkIcon  = ({ s = 20, c = "currentColor" }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const ChevL    = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
const ChevD    = ({ r }) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.3s", transform: r ? "rotate(180deg)" : "none", display: "block" }}><polyline points="6 9 12 15 18 9" /></svg>);
const XIco     = ({ s = 20 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const SrchIco  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const InfoIco  = ({ s = 16 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>);
const WarnIco  = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>);
const SpoonIco = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><line x1="7" y1="2" x2="7" y2="22" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 .9.7 1.8 1.6 2l1.4.5V22" /></svg>);
const OkCircle = () => (<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>);

// ─── ProgressSteps ────────────────────────────────────────────────────────────
function ProgressSteps({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1.25rem 0", overflowX: "auto" }}>
      {STEPS.map((step, i) => {
        const done = current > step.id, active = current === step.id;
        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
              <div style={{ width: "2.125rem", height: "2.125rem", borderRadius: "50%", background: done ? "#10b981" : active ? "#8368ef" : "#e5e7eb", color: (done || active) ? "white" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.875rem", transition: "all 0.3s", flexShrink: 0 }}>
                {done ? <ChkIcon s={15} c="white" /> : step.id}
              </div>
              <span style={{ fontSize: "0.7rem", fontWeight: active ? 600 : 400, whiteSpace: "nowrap", color: active ? "#8368ef" : done ? "#10b981" : "#9ca3af" }}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ height: "2px", width: "clamp(20px,4vw,56px)", background: done ? "#10b981" : "#e5e7eb", margin: "0 4px", marginBottom: "1.25rem", transition: "background 0.3s", flexShrink: 1 }} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── PricingCard ──────────────────────────────────────────────────────────────
function PricingCard({ pricing }) {
  const { foodDesc, foodTotal, addonSummary, minimumCharge, subtotal, tax5, tax18, total } = pricing;
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1.5rem" }}>
      <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", margin: "0 0 1.25rem 0" }}>Price Estimate</p>
      {foodTotal > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <span style={{ color: "#6b7280", fontSize: "0.875rem", flex: 1, paddingRight: "0.5rem" }}>{foodDesc}</span>
            <span style={{ fontWeight: 600, color: "#111827", flexShrink: 0 }}>{fmt(foodTotal)}</span>
          </div>
          {addonSummary > 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}><span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Add-ons</span><span style={{ fontWeight: 600, color: "#111827" }}>{fmt(addonSummary)}</span></div>}
          {minimumCharge > 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}><span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Minimum charge</span><span style={{ fontWeight: 600, color: "#111827" }}>{fmt(minimumCharge)}</span></div>}
        </div>
      )}
      <div style={{ height: "1px", background: "#e5e7eb", margin: "1rem 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}><span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Subtotal</span><span style={{ fontWeight: 600, color: "#111827" }}>{fmt(subtotal)}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}><span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Tax (5% food)</span><span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>{fmt(tax5)}</span></div>
      {tax18 > 0 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}><span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Tax (18% add-ons)</span><span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>{fmt(tax18)}</span></div>}
      <div style={{ height: "1px", background: "#e5e7eb", margin: "1rem 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
        <span style={{ fontWeight: 600, color: "#111827", fontSize: "1rem" }}>Estimated Total</span>
        <span style={{ fontWeight: 700, color: "#8368ef", fontSize: "1.25rem" }}>{fmt(total)}</span>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", padding: "0.75rem", background: "#f9fafb", borderRadius: "0.375rem", marginTop: "1rem", alignItems: "flex-start" }}>
        <div style={{ flexShrink: 0, marginTop: "1px", color: "#6b7280" }}><InfoIco s={13} /></div>
        <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0, lineHeight: 1.5 }}>This is an estimate. Final pricing will be confirmed in your quote.</p>
      </div>
    </div>
  );
}

// ─── Step 1 — Event Details ───────────────────────────────────────────────────
function StepEventDetails({ ctx, adultCount, setAdultCount, childCount, setChildCount }) {
  const guestCount = adultCount + childCount;
  const belowMin = guestCount > 0 && guestCount < MINIMUM_PAX;

  function Stepper({ value, onChange }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", border: "1.5px solid #d1d5db", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", color: "#374151", lineHeight: 1 }}>−</button>
        <input type="number" min="0" value={value} onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: "4rem", textAlign: "center", border: "1.5px solid #d1d5db", borderRadius: "0.375rem", padding: "0.375rem 0", fontSize: "1.125rem", fontWeight: 600 }} />
        <button type="button" onClick={() => onChange(value + 1)} style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", border: "none", background: "#8368ef", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", lineHeight: 1 }}>+</button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827", margin: "0 0 0.375rem 0" }}>Event Details &amp; Guest Information</h2>
      <p style={{ color: "#6b7280", margin: "0 0 1.5rem 0", fontSize: "0.9375rem" }}>Review your event details and confirm the guest count.</p>
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1rem" }}>
          {[{ label: "Event Type", value: ctx.eventType }, { label: "Date", value: fmtDate(ctx.date) }, { label: "Shift", value: ctx.shift }, { label: "Venue", value: ctx.venueName }].filter(r => r.value).map(row => (
            <div key={row.label}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", margin: "0 0 0.25rem 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</p>
              <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#111827", margin: 0 }}>{row.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1.25rem", marginBottom: "1rem" }}>
        <h3 style={{ fontWeight: 600, color: "#111827", margin: "0 0 1.25rem 0", fontSize: "1rem" }}>Guest Count</h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 0", borderBottom: "1px solid #f3f4f6" }}>
          <div><p style={{ fontWeight: 600, color: "#111827", margin: "0 0 0.2rem 0" }}>Adults</p><p style={{ fontSize: "0.8125rem", color: "#6b7280", margin: 0 }}>Age 13 and above</p></div>
          <Stepper value={adultCount} onChange={setAdultCount} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 0" }}>
          <div><p style={{ fontWeight: 600, color: "#111827", margin: "0 0 0.2rem 0" }}>Children</p><p style={{ fontSize: "0.8125rem", color: "#6b7280", margin: 0 }}>Age 2–12</p></div>
          <Stepper value={childCount} onChange={setChildCount} />
        </div>
      </div>
      {belowMin && (<div style={{ display: "flex", gap: "0.75rem", padding: "0.875rem 1rem", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "0.5rem", marginBottom: "1rem" }}><div style={{ color: "#d97706", flexShrink: 0 }}><WarnIco /></div><p style={{ color: "#92400e", margin: 0, fontSize: "0.875rem", lineHeight: 1.5 }}>Minimum pax is <strong>{MINIMUM_PAX}</strong> guests. A minimum charge applies for {MINIMUM_PAX - guestCount} additional guests.</p></div>)}
      <div style={{ display: "flex", gap: "0.75rem", padding: "0.875rem 1rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "0.5rem" }}>
        <div style={{ color: "#3b82f6", flexShrink: 0, marginTop: "1px" }}><InfoIco s={16} /></div>
        <p style={{ color: "#1e40af", margin: 0, fontSize: "0.875rem", lineHeight: 1.5 }}>This is an enquiry form. You will receive a detailed quote within 24 hours of submission.</p>
      </div>
    </div>
  );
}

// ─── Step 2 — Food Menu ───────────────────────────────────────────────────────
function StepFoodMenu({ menuTab, packagesList, loadingPackages, selectedPackage, adultCount, openPackageModal, customMenuItems, openCustomMenuModal, removeCustomItem, onSwitchTab }) {
  const groupedCustom = useMemo(() => {
    const map = {};
    customMenuItems.forEach(item => { const cat = item.category_name || "Other"; if (!map[cat]) map[cat] = []; map[cat].push(item); });
    return map;
  }, [customMenuItems]);

  return (
    <div>
      <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827", margin: "0 0 0.375rem 0" }}>Food Menu Selection</h2>
      <p style={{ color: "#6b7280", margin: "0 0 1.5rem 0", fontSize: "0.9375rem" }}>Choose a preset package or build your own custom menu.</p>
      <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "0.5rem", padding: "0.25rem", marginBottom: "1.5rem", width: "fit-content" }}>
        {[{ id: "packages", label: "Preset Packages" }, { id: "custom", label: "Custom Menu" }].map(tab => (
          <button key={tab.id} type="button" onClick={() => onSwitchTab(tab.id)} style={{ padding: "0.5rem 1.25rem", borderRadius: "0.375rem", border: "none", fontWeight: 500, fontSize: "0.9375rem", cursor: "pointer", transition: "all 0.2s", background: menuTab === tab.id ? "white" : "transparent", color: menuTab === tab.id ? "#111827" : "#6b7280", boxShadow: menuTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>{tab.label}</button>
        ))}
      </div>

      {menuTab === "packages" && (
        loadingPackages ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
            <div style={{ width: "2rem", height: "2rem", border: "2px solid #e5e7eb", borderTopColor: "#8368ef", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ margin: 0 }}>Loading packages…</p>
          </div>
        ) : packagesList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af", border: "2px dashed #e5e7eb", borderRadius: "0.5rem" }}><p style={{ fontWeight: 500, margin: 0 }}>No packages available.</p></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
            {packagesList.map(pkg => {
              const isSel = selectedPackage?.id === pkg.id;
              const total = (pkg.package_amount || 0) * adultCount;
              return (
                <div key={pkg.id} onClick={() => openPackageModal(pkg)} style={{ background: "white", border: `2px solid ${isSel ? "#8368ef" : "#e5e7eb"}`, borderRadius: "0.75rem", padding: "1.25rem", cursor: "pointer", transition: "all 0.2s", position: "relative", boxShadow: isSel ? "0 0 0 3px rgba(131,104,239,0.15)" : "none" }}>
                  {isSel && <span style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "#8368ef", color: "white", borderRadius: "9999px", padding: "0.2rem 0.6rem", fontSize: "0.75rem", fontWeight: 600 }}>Selected</span>}
                  {pkg.is_popular && !isSel && <span style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "#fef3c7", color: "#92400e", borderRadius: "9999px", padding: "0.2rem 0.6rem", fontSize: "0.75rem", fontWeight: 600 }}>Popular</span>}
                  <h3 style={{ fontWeight: 700, color: "#111827", margin: "0 0 0.375rem 0", fontSize: "1rem", paddingRight: "4rem" }}>{pkg.package_name}</h3>
                  <p style={{ fontWeight: 700, color: "#8368ef", margin: "0 0 0.75rem 0", fontSize: "1.125rem" }}>{fmt(pkg.package_amount)} <span style={{ fontSize: "0.8125rem", color: "#6b7280", fontWeight: 400 }}>/ person</span></p>
                  <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                    {pkg.package_food_type === 1 && <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", background: "#dcfce7", color: "#166534", borderRadius: "9999px", fontWeight: 600 }}>Veg</span>}
                    {pkg.package_food_type === 2 && <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", background: "#fee2e2", color: "#991b1b", borderRadius: "9999px", fontWeight: 600 }}>Non-Veg</span>}
                  </div>
                  {pkg.categories?.length > 0 && (<div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.75rem" }}>{pkg.categories.slice(0, 4).map((cat, ci) => <span key={ci} style={{ fontSize: "0.75rem", color: "#6b7280", background: "#f3f4f6", padding: "0.2rem 0.5rem", borderRadius: "0.25rem" }}>{cat.name || cat}</span>)}{pkg.categories.length > 4 && <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>+{pkg.categories.length - 4}</span>}</div>)}
                  {adultCount > 0 && (<div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>{adultCount} × {fmt(pkg.package_amount)}</span><span style={{ fontWeight: 700, color: "#111827" }}>{fmt(total)}</span></div>)}
                  <p style={{ margin: "0.625rem 0 0", fontSize: "0.8125rem", color: "#8368ef", fontWeight: 500 }}>Click to customise menu →</p>
                </div>
              );
            })}
          </div>
        )
      )}

      {menuTab === "custom" && (
        customMenuItems.length === 0 ? (
          <div onClick={openCustomMenuModal} style={{ textAlign: "center", padding: "3rem 2rem", border: "2px dashed #d1d5db", borderRadius: "0.75rem", cursor: "pointer" }}>
            <div style={{ color: "#8368ef", display: "inline-block", marginBottom: "1rem" }}><SpoonIco /></div>
            <p style={{ fontWeight: 600, color: "#374151", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Build Your Custom Menu</p>
            <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: "0 0 1.25rem 0" }}>Choose from our full menu catalogue</p>
            <button type="button" style={{ padding: "0.625rem 1.5rem", background: "#8368ef", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer" }}>Browse Menu Items</button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <p style={{ fontWeight: 600, color: "#111827", margin: 0 }}>{customMenuItems.length} items selected</p>
              <button type="button" onClick={openCustomMenuModal} style={{ padding: "0.5rem 1rem", background: "white", border: "1.5px solid #8368ef", color: "#8368ef", borderRadius: "0.375rem", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>Edit Menu</button>
            </div>
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
              {Object.entries(groupedCustom).map(([cat, items]) => (
                <div key={cat} style={{ borderBottom: "1px solid #f3f4f6", padding: "1rem 1.25rem" }}>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.5rem 0" }}>{cat}</p>
                  {items.map(item => (<div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0" }}><span style={{ color: item.food_type === 1 ? "#16a34a" : "#dc2626", fontSize: "0.875rem" }}>●</span><span style={{ flex: 1, fontSize: "0.875rem", color: "#374151" }}>{item.item_name}</span><button type="button" onClick={() => removeCustomItem(item.id)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: "0.25rem", display: "flex" }}><XIco s={14} /></button></div>))}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ─── Step 3 — Requirements ────────────────────────────────────────────────────
function StepRequirements({ dietary, setDietary, allergies, setAllergies, otherAllergy, setOtherAllergy, servingPref, setServingPref, notes, setNotes }) {
  return (
    <div>
      <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827", margin: "0 0 0.375rem 0" }}>Special Requirements</h2>
      <p style={{ color: "#6b7280", margin: "0 0 1.5rem 0", fontSize: "0.9375rem" }}>Help us tailor your event perfectly.</p>
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1.25rem", marginBottom: "1rem" }}>
        <h3 style={{ fontWeight: 600, color: "#111827", margin: "0 0 1rem 0", fontSize: "1rem" }}>Dietary Restrictions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: "0.75rem" }}>
          {DIETARY_OPTIONS.map(opt => (<label key={opt.id} style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer" }}><input type="checkbox" checked={!!dietary[opt.id]} onChange={e => setDietary(p => ({ ...p, [opt.id]: e.target.checked }))} style={{ width: "1.125rem", height: "1.125rem", accentColor: "#8368ef" }} /><span style={{ fontSize: "0.9375rem", color: "#374151" }}>{opt.label}</span></label>))}
        </div>
      </div>
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1.25rem", marginBottom: "1rem" }}>
        <h3 style={{ fontWeight: 600, color: "#111827", margin: "0 0 1rem 0", fontSize: "1rem" }}>Allergies</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: "0.75rem" }}>
          {ALLERGY_OPTIONS.map(opt => (<label key={opt.id} style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer" }}><input type="checkbox" checked={!!allergies[opt.id]} onChange={e => setAllergies(p => ({ ...p, [opt.id]: e.target.checked }))} style={{ width: "1.125rem", height: "1.125rem", accentColor: "#8368ef" }} /><span style={{ fontSize: "0.9375rem", color: "#374151" }}>{opt.label}</span></label>))}
        </div>
        {allergies.other && (<input type="text" placeholder="Please specify other allergies" value={otherAllergy} onChange={e => setOtherAllergy(e.target.value)} style={{ marginTop: "0.875rem", width: "100%", padding: "0.625rem 0.875rem", border: "1.5px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.9375rem" }} />)}
      </div>
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1.25rem", marginBottom: "1rem" }}>
        <h3 style={{ fontWeight: 600, color: "#111827", margin: "0 0 1rem 0", fontSize: "1rem" }}>Serving Preference</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "0.75rem" }}>
          {SERVING_PREFS.map(pref => (<label key={pref} style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer" }}><input type="radio" name="servingPref" value={pref} checked={servingPref === pref} onChange={() => setServingPref(pref)} style={{ width: "1.125rem", height: "1.125rem", accentColor: "#8368ef" }} /><span style={{ fontSize: "0.9375rem", color: "#374151" }}>{pref}</span></label>))}
        </div>
      </div>
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1.25rem" }}>
        <h3 style={{ fontWeight: 600, color: "#111827", margin: "0 0 0.375rem 0", fontSize: "1rem" }}>Additional Notes</h3>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0 0 0.75rem 0" }}>Special requests, decor preferences, or anything else?</p>
        <textarea rows={4} placeholder="E.g. Floral centerpiece theme, live music setup, etc." value={notes} onChange={e => setNotes(e.target.value)} style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.9375rem", resize: "vertical", lineHeight: 1.5 }} />
      </div>
    </div>
  );
}

// ─── Step 4 — Contact ─────────────────────────────────────────────────────────
function StepContact({ name, setName, email, setEmail, phone, setPhone, org, setOrg, errors }) {
  const field = (lbl, val, set, type, ph, err, req) => (
    <div>
      <label style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.375rem", fontSize: "0.9375rem" }}>{lbl}{req && <span style={{ color: "#ef4444" }}> *</span>}</label>
      <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph} style={{ width: "100%", padding: "0.75rem 1rem", border: `1.5px solid ${err ? "#ef4444" : "#d1d5db"}`, borderRadius: "0.5rem", fontSize: "0.9375rem" }} />
      {err && <p style={{ color: "#ef4444", fontSize: "0.8125rem", margin: "0.375rem 0 0" }}>{err}</p>}
    </div>
  );
  return (
    <div>
      <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827", margin: "0 0 0.375rem 0" }}>Contact Information</h2>
      <p style={{ color: "#6b7280", margin: "0 0 1.5rem 0", fontSize: "0.9375rem" }}>We will use these details to send your quote.</p>
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {field("Full Name", name, setName, "text", "Your full name", errors.name, true)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {field("Email", email, setEmail, "email", "your@email.com", errors.email, true)}
          {field("Phone", phone, setPhone, "tel", "+91 XXXXX XXXXX", errors.phone, true)}
        </div>
        <div>
          <label style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.375rem", fontSize: "0.9375rem" }}>Organization <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "0.8125rem" }}>(optional)</span></label>
          <input type="text" value={org} onChange={e => setOrg(e.target.value)} placeholder="Company or organization name" style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.9375rem" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Step 5 — Review ──────────────────────────────────────────────────────────
function RSection({ title, children, last }) { return (<div style={{ borderBottom: last ? "none" : "1px solid #f3f4f6" }}><div style={{ padding: "0.75rem 1.25rem", background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}><p style={{ fontWeight: 600, color: "#374151", margin: 0, fontSize: "0.9375rem" }}>{title}</p></div><div style={{ padding: "0.875rem 1.25rem" }}>{children}</div></div>); }
function RRow({ label, value }) { return (<div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", alignItems: "flex-start" }}><span style={{ minWidth: "130px", fontSize: "0.875rem", color: "#6b7280", flexShrink: 0 }}>{label}</span><span style={{ fontSize: "0.875rem", color: "#111827", fontWeight: 500 }}>{String(value ?? "—")}</span></div>); }

function StepReview({ ctx, adultCount, childCount, menuTab, selectedPackage, customMenuItems, dietary, allergies, otherAllergy, servingPref, notes, name, email, phone, org, pricing }) {
  const actD = Object.entries(dietary).filter(([, v]) => v).map(([k]) => DIETARY_OPTIONS.find(o => o.id === k)?.label).filter(Boolean);
  const actA = Object.entries(allergies).filter(([, v]) => v).map(([k]) => k === "other" ? (otherAllergy || "Other") : ALLERGY_OPTIONS.find(o => o.id === k)?.label).filter(Boolean);
  const grp = useMemo(() => { const m = {}; customMenuItems.forEach(i => { const c = i.category_name || "Other"; if (!m[c]) m[c] = []; m[c].push(i); }); return m; }, [customMenuItems]);
  return (
    <div>
      <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827", margin: "0 0 0.375rem 0" }}>Review &amp; Submit</h2>
      <p style={{ color: "#6b7280", margin: "0 0 1.5rem 0", fontSize: "0.9375rem" }}>Please review your enquiry before submitting.</p>
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.75rem", overflow: "hidden" }}>
        <RSection title="Event Details"><RRow label="Event Type" value={ctx.eventType} /><RRow label="Date" value={fmtDate(ctx.date)} /><RRow label="Shift" value={ctx.shift} />{ctx.venueName && <RRow label="Venue" value={ctx.venueName} />}</RSection>
        <RSection title="Guest Count"><RRow label="Adults" value={adultCount} />{childCount > 0 && <RRow label="Children" value={childCount} />}<RRow label="Total" value={adultCount + childCount} /></RSection>
        <RSection title="Menu Selection">
          {menuTab === "packages" && selectedPackage ? (<><RRow label="Package" value={selectedPackage.package_name} /><RRow label="Price/person" value={fmt(selectedPackage.package_amount)} /></>) : menuTab === "custom" && customMenuItems.length > 0 ? (<><RRow label="Type" value="Custom Menu" />{Object.entries(grp).map(([c, it]) => <RRow key={c} label={c} value={it.map(i => i.item_name).join(", ")} />)}</>) : (<RRow label="Menu" value="Not selected" />)}
        </RSection>
        {(actD.length > 0 || actA.length > 0 || servingPref || notes) && (<RSection title="Special Requirements">{actD.length > 0 && <RRow label="Dietary" value={actD.join(", ")} />}{actA.length > 0 && <RRow label="Allergies" value={actA.join(", ")} />}{servingPref && <RRow label="Serving" value={servingPref} />}{notes && <RRow label="Notes" value={notes} />}</RSection>)}
        <RSection title="Contact Information" last><RRow label="Name" value={name} /><RRow label="Email" value={email} /><RRow label="Phone" value={phone} />{org && <RRow label="Organization" value={org} />}</RSection>
      </div>
      {pricing.total > 0 && (<div style={{ marginTop: "1.25rem", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: "0.75rem", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 600, color: "#6d28d9", fontSize: "1rem" }}>Estimated Total</span><span style={{ fontWeight: 700, color: "#8368ef", fontSize: "1.5rem" }}>{fmt(pricing.total)}</span></div>)}
      <div style={{ display: "flex", gap: "0.75rem", padding: "0.875rem 1rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "0.5rem", marginTop: "1.25rem" }}>
        <div style={{ color: "#3b82f6", flexShrink: 0, marginTop: "1px" }}><InfoIco s={16} /></div>
        <p style={{ color: "#1e40af", margin: 0, fontSize: "0.875rem", lineHeight: 1.5 }}>By submitting this enquiry, you agree to receive a detailed quote via email within 24 hours. No payment is required at this stage.</p>
      </div>
    </div>
  );
}

// ─── PackageModal ─────────────────────────────────────────────────────────────
function PackageModal({ pkg, menuCategories, menuItems, selections, setSelections, onCancel, onConfirm }) {
  const [expandedCats, setExpandedCats] = useState({});
  const categories = useMemo(() => {
    if (!pkg || !menuCategories) return [];
    const ids = new Set((pkg.categories || []).map(c => c.id ?? c));
    return ids.size > 0 ? menuCategories.filter(c => ids.has(c.id)) : menuCategories;
  }, [pkg, menuCategories]);

  const toggleCat = (id) => setExpandedCats(p => ({ ...p, [id]: !p[id] }));
  const toggleItem = (catId, item) => setSelections(p => { const cur = p[catId] || []; return { ...p, [catId]: cur.some(i => i.id === item.id) ? cur.filter(i => i.id !== item.id) : [...cur, item] }; });
  const done = categories.filter(c => (selections[c.id] || []).length > 0).length;
  const allOk = categories.length > 0 && done === categories.length;
  const preview = useMemo(() => { const m = {}; categories.forEach(c => { const s = selections[c.id] || []; if (s.length) m[c.name] = s; }); return m; }, [categories, selections]);
  const forCat = (cid) => (menuItems || []).filter(i => i.category_id === cid || i.category === cid);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, overflowY: "auto", padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: "1rem", maxWidth: "1200px", width: "95%", maxHeight: "85vh", height: "100%", display: "grid", gridTemplateColumns: "1.5fr 1fr", overflow: "hidden" }}>
        {/* Left panel */}
        <div style={{ overflowY: "auto", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb", background: "#fafafa", position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontWeight: 700, color: "#111827", margin: "0 0 0.25rem 0", fontSize: "1.25rem" }}>{pkg?.package_name}</h2>
                <p style={{ color: "#6b7280", margin: 0, fontSize: "0.875rem" }}>Select items for each category</p>
              </div>
              <button type="button" onClick={onCancel} style={{ width: "2rem", height: "2rem", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: "#6b7280", cursor: "pointer", borderRadius: "0.375rem" }}><XIco /></button>
            </div>
          </div>
          <div style={{ padding: "1rem 1.5rem", background: "#fffbeb", borderBottom: "1px solid #fde68a", fontWeight: 600, fontSize: "0.9375rem", color: "#92400e" }}>
            Menu Selection Progress: {done}/{categories.length} completed
          </div>
          <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
            {categories.map((cat, ci) => {
              const catItems = forCat(cat.id), catSel = selections[cat.id] || [], isOpen = !!expandedCats[cat.id];
              return (
                <div key={cat.id} style={{ marginBottom: "1.5rem", paddingBottom: "0.5rem", borderBottom: ci < categories.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: catSel.length > 0 ? "#10b981" : "#8368ef", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0, transition: "background 0.2s" }}>
                      {catSel.length > 0 ? <ChkIcon s={14} c="white" /> : ci + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.625rem" }}>
                        <div>
                          <p style={{ fontWeight: 600, color: "#111827", margin: "0 0 0.2rem 0" }}>{cat.name}</p>
                          <p style={{ color: "#6b7280", fontSize: "0.8125rem", margin: 0 }}>{catSel.length} selected</p>
                        </div>
                        <button type="button" onClick={() => toggleCat(cat.id)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.875rem", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "0.375rem", color: "#374151", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", flexShrink: 0 }}>
                          {isOpen ? "Collapse" : "Select"} <ChevD r={isOpen} />
                        </button>
                      </div>
                      {catSel.length > 0 && !isOpen && (<div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>{catSel.map(item => <span key={item.id} style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: "0.25rem", color: "#6d28d9" }}>{item.item_name}</span>)}</div>)}
                      {isOpen && (
                        <div style={{ marginTop: "0.75rem", padding: "1rem", background: "#f9fafb", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: "0.625rem" }}>
                            {catItems.map(item => {
                              const isSel = catSel.some(i => i.id === item.id);
                              return (
                                <div key={item.id} onClick={() => toggleItem(cat.id, item)} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0.75rem", border: `2px solid ${isSel ? "#8368ef" : "#e5e7eb"}`, borderRadius: "0.375rem", cursor: "pointer", transition: "all 0.15s", background: isSel ? "#f5f3ff" : "white" }}>
                                  <input type="checkbox" checked={isSel} readOnly style={{ width: "1.125rem", height: "1.125rem", accentColor: "#8368ef", flexShrink: 0, pointerEvents: "none" }} />
                                  <span style={{ flex: 1, fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{item.item_name}</span>
                                  <span style={{ color: item.food_type === 1 ? "#16a34a" : "#dc2626", fontSize: "0.875rem", flexShrink: 0 }}>●</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ position: "sticky", bottom: 0, background: "white", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid #eee" }}>
            <button type="button" onClick={onCancel} style={{ padding: "0.625rem 1.25rem", background: "transparent", border: "1px solid #d1d5db", color: "#374151", borderRadius: "0.375rem", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
            <button type="button" onClick={onConfirm} disabled={!allOk} style={{ padding: "0.625rem 1.5rem", background: allOk ? "#8368ef" : "#ccc", color: "white", border: "none", borderRadius: "0.375rem", fontWeight: 600, cursor: allOk ? "pointer" : "not-allowed" }}>Confirm Selection</button>
          </div>
        </div>
        {/* Right preview */}
        <div style={{ background: "#fafafa", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "1.5rem", background: "white", fontWeight: 700, fontSize: "1.125rem", color: "#111827", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0 }}>Menu Preview</div>
          {Object.keys(preview).length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", color: "#9ca3af", textAlign: "center" }}>
              <p style={{ fontWeight: 600, margin: "0 0 0.5rem", color: "#6b7280" }}>No items selected yet</p>
              <p style={{ fontSize: "0.875rem", margin: 0 }}>Select items from the left panel</p>
            </div>
          ) : (
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {Object.entries(preview).map(([catName, items]) => (
                <div key={catName} style={{ background: "white", borderRadius: "0.5rem", padding: "1rem", border: "1px solid #e5e7eb" }}>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 0.75rem 0" }}>{catName}</p>
                  {items.map(item => (<div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0", fontSize: "0.875rem", color: "#374151" }}><span style={{ color: item.food_type === 1 ? "#16a34a" : "#dc2626" }}>●</span>{item.item_name}</div>))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CustomMenuModal ──────────────────────────────────────────────────────────
function CustomMenuModal({ menuCategories, menuItems, selected, setSelected, onClose, onConfirm, isMobile }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeCat, setActiveCat] = useState(() => menuCategories?.[0]?.id || null);
  const [expandSel, setExpandSel] = useState(false);

  const visible = useMemo(() => {
    let items = activeCat ? (menuItems || []).filter(i => i.category_id === activeCat) : (menuItems || []);
    if (filter === "veg") items = items.filter(i => i.food_type === 1);
    if (filter === "nonveg") items = items.filter(i => i.food_type !== 1);
    if (search) items = items.filter(i => i.item_name?.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [menuItems, activeCat, filter, search]);

  const toggleItem = (item) => setSelected(p => p.some(i => i.id === item.id) ? p.filter(i => i.id !== item.id) : [...p, item]);
  const grpSel = useMemo(() => { const m = {}; selected.forEach(item => { const c = item.category_name || "Other"; if (!m[c]) m[c] = []; m[c].push(item); }); return m; }, [selected]);

  const Header = () => (
    <div style={{ borderBottom: "1px solid #e5e7eb", background: "#fafafa", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", padding: "1.5rem 1.5rem 1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <div style={{ color: "#8368ef" }}><SpoonIco /></div>
          <div><h2 style={{ fontWeight: 700, color: "#111827", margin: "0 0 0.25rem 0", fontSize: "1.25rem" }}>Custom Menu</h2><p style={{ color: "#6b7280", margin: 0, fontSize: "0.875rem" }}>{selected.length} items selected</p></div>
        </div>
        <button type="button" onClick={onClose} style={{ width: "2rem", height: "2rem", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: "#6b7280", cursor: "pointer", borderRadius: "0.375rem", flexShrink: 0 }}><XIco /></button>
      </div>
      <div style={{ position: "relative", padding: "0 1.5rem 0.875rem" }}>
        <div style={{ position: "absolute", left: "2.25rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none", display: "flex" }}><SrchIco /></div>
        <input type="text" placeholder="Search menu items…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem 0.625rem 2.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.875rem" }} />
      </div>
      <div style={{ display: "flex", gap: "0.5rem", padding: "0 1.5rem 0.875rem" }}>
        {[["all", "All"], ["veg", "🟢 Veg"], ["nonveg", "🔴 Non-Veg"]].map(([v, l]) => (<button key={v} type="button" onClick={() => setFilter(v)} style={{ padding: "0.375rem 0.875rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", background: filter === v ? "#8368ef" : "white", color: filter === v ? "white" : "#374151", fontWeight: 500, fontSize: "0.8125rem", cursor: "pointer" }}>{l}</button>))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", padding: "0 1.5rem 1.25rem", overflowX: "auto" }}>
        <button type="button" onClick={() => setActiveCat(null)} style={{ padding: "0.375rem 0.875rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", background: activeCat === null ? "#8368ef" : "white", color: activeCat === null ? "white" : "#374151", fontWeight: 500, fontSize: "0.8125rem", cursor: "pointer", whiteSpace: "nowrap" }}>All</button>
        {(menuCategories || []).map(cat => (<button key={cat.id} type="button" onClick={() => setActiveCat(cat.id)} style={{ padding: "0.375rem 0.875rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", background: activeCat === cat.id ? "#8368ef" : "white", color: activeCat === cat.id ? "white" : "#374151", fontWeight: 500, fontSize: "0.8125rem", cursor: "pointer", whiteSpace: "nowrap" }}>{cat.name}</button>))}
      </div>
    </div>
  );

  const Grid = () => (
    <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
      {visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}><p style={{ fontWeight: 500, margin: 0 }}>No items found</p></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "0.625rem" }}>
          {visible.map(item => {
            const isSel = selected.some(i => i.id === item.id);
            return (
              <div key={item.id} onClick={() => toggleItem(item)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", background: isSel ? "#f5f3ff" : "white", border: `2px solid ${isSel ? "#8368ef" : "#e5e7eb"}`, borderRadius: "0.5rem", cursor: "pointer", transition: "all 0.15s" }}>
                <input type="checkbox" checked={isSel} readOnly style={{ width: "1.125rem", height: "1.125rem", accentColor: "#8368ef", flexShrink: 0, pointerEvents: "none" }} />
                <span style={{ flex: 1, fontSize: "0.9375rem", fontWeight: 600, color: "#111827" }}>{item.item_name}</span>
                <span style={{ color: item.food_type === 1 ? "#16a34a" : "#dc2626", flexShrink: 0 }}>●</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const Right = () => (
    <div style={{ display: "flex", flexDirection: "column", background: "#fafafa", overflow: "hidden", borderLeft: "1px solid #e5e7eb" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
        <h3 style={{ fontWeight: 700, color: "#111827", margin: 0, fontSize: "1.125rem" }}>Your Selection</h3>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#8368ef", background: "white", padding: "0.25rem 0.625rem", borderRadius: "9999px", border: "1px solid #ede9fe" }}>{selected.length} items</span>
      </div>
      {selected.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", color: "#9ca3af" }}>
          <div style={{ marginBottom: "0.75rem" }}><SpoonIco /></div>
          <p style={{ fontWeight: 500, margin: 0 }}>No items selected yet</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
          {Object.entries(grpSel).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 0.625rem 0" }}>{cat}</p>
              {items.map(item => (<div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0.75rem", background: "white", borderRadius: "0.375rem", marginBottom: "0.375rem", border: "1px solid #e5e7eb" }}><span style={{ color: item.food_type === 1 ? "#16a34a" : "#dc2626", fontSize: "0.875rem" }}>●</span><span style={{ flex: 1, fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{item.item_name}</span><button type="button" onClick={() => toggleItem(item)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: "0.25rem", display: "flex" }}><XIco s={14} /></button></div>))}
            </div>
          ))}
        </div>
      )}
      <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #e5e7eb", background: "white", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.75rem", background: "#eff6ff", borderRadius: "0.375rem", marginBottom: "1rem" }}>
          <div style={{ color: "#3b82f6", flexShrink: 0, marginTop: "1px" }}><InfoIco s={13} /></div>
          <span style={{ fontSize: "0.75rem", color: "#1e40af", lineHeight: 1.4 }}>Custom menu pricing will be quoted separately by the venue.</span>
        </div>
        <button type="button" onClick={onConfirm} style={{ width: "100%", padding: "0.75rem", background: "#8368ef", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer", fontSize: "0.9375rem" }}>Confirm Selection ({selected.length})</button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", zIndex: 10000 }}>
        <div style={{ background: "white", borderRadius: "1rem 1rem 0 0", width: "100%", maxHeight: "95vh", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}><Header /><Grid /></div>
          <div style={{ background: "white", borderTop: "2px solid #e5e7eb", flexShrink: 0 }}>
            <button type="button" onClick={() => setExpandSel(p => !p)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "0.875rem 1.5rem", background: "#f9fafb", border: "none", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.9375rem" }}>
              <span style={{ background: "#8368ef", color: "white", borderRadius: "9999px", padding: "0.2rem 0.6rem", fontSize: "0.875rem", fontWeight: 700 }}>{selected.length}</span>
              {expandSel ? "Hide" : "View"} Selection <ChevD r={expandSel} />
            </button>
            {expandSel && (
              <div style={{ maxHeight: "40vh", overflowY: "auto", padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb" }}>
                {selected.length === 0 ? <p style={{ color: "#9ca3af", textAlign: "center", margin: 0 }}>No items selected</p> : Object.entries(grpSel).map(([cat, items]) => (
                  <div key={cat} style={{ marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.5rem" }}>{cat}</p>
                    {items.map(item => (<div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0" }}><span style={{ color: item.food_type === 1 ? "#16a34a" : "#dc2626" }}>●</span><span style={{ flex: 1, fontSize: "0.875rem" }}>{item.item_name}</span><button type="button" onClick={() => toggleItem(item)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", display: "flex" }}><XIco s={14} /></button></div>))}
                  </div>
                ))}
              </div>
            )}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb" }}>
              <button type="button" onClick={onConfirm} style={{ width: "100%", padding: "0.875rem", background: "#8368ef", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer", fontSize: "1rem" }}>Confirm Selection ({selected.length})</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: "1rem", maxWidth: "1400px", width: "95%", maxHeight: "90vh", height: "100%", display: "grid", gridTemplateColumns: "1fr 380px", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}><Header /><Grid /></div>
        <Right />
      </div>
    </div>
  );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10001, padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: "0.75rem", padding: "2rem", maxWidth: "400px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", color: "#f59e0b" }}><WarnIco /></div>
        <h3 style={{ fontWeight: 700, color: "#111827", margin: "0 0 0.75rem", fontSize: "1.25rem" }}>{title}</h3>
        <p style={{ color: "#6b7280", margin: "0 0 1.5rem", lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="button" onClick={onCancel} style={{ flex: 1, padding: "0.625rem 1.25rem", background: "transparent", border: "1px solid #d1d5db", color: "#374151", borderRadius: "0.375rem", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
          <button type="button" onClick={onConfirm} style={{ flex: 1, padding: "0.625rem 1.25rem", background: "#8368ef", color: "white", border: "none", borderRadius: "0.375rem", fontWeight: 600, cursor: "pointer" }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ─── SuccessModal ─────────────────────────────────────────────────────────────
function SuccessModal({ refNum, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10002, padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: "0.75rem", padding: "2rem", maxWidth: "28rem", width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}><OkCircle /></div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: "0 0 0.75rem" }}>Enquiry Submitted!</h2>
        <p style={{ color: "#6b7280", margin: "0 0 1.5rem", lineHeight: 1.5 }}>Your booking enquiry has been received. We will send you a detailed quote within 24 hours.</p>
        {refNum && (
          <div style={{ background: "#f3f4f6", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1.5rem" }}>
            <span style={{ display: "block", fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Reference Number</span>
            <span style={{ display: "block", fontSize: "1.25rem", fontWeight: 700, color: "#8368ef", fontFamily: "Courier New, monospace" }}>{refNum}</span>
          </div>
        )}
        <div style={{ display: "flex", gap: "0.75rem", flexDirection: "column" }}>
          <div style={{ display: "flex", gap: "0.5rem", padding: "0.875rem", background: "#f0fdf4", borderRadius: "0.5rem", alignItems: "flex-start" }}>
            <ChkIcon s={16} c="#16a34a" />
            <span style={{ fontSize: "0.875rem", color: "#15803d", textAlign: "left", lineHeight: 1.5 }}>A confirmation has been logged. Our team will reach out within 24 hours with a detailed quote.</span>
          </div>
          <button type="button" onClick={onClose} style={{ width: "100%", padding: "0.75rem", background: "#8368ef", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer", fontSize: "1rem" }}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}

// ─── MobileBottomBar ──────────────────────────────────────────────────────────
function MobileBottomBar({ pricing, showPanel, onToggle }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e5e7eb", boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.1)", zIndex: 40 }}>
      {showPanel && (
        <div style={{ borderTop: "1px solid #e5e7eb", maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, background: "white" }}>
            <h3 style={{ fontWeight: 600, color: "#111827", margin: 0 }}>Price Breakdown</h3>
            <button type="button" onClick={onToggle} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", display: "flex" }}><XIco /></button>
          </div>
          <div style={{ padding: "1rem" }}><PricingCard pricing={pricing} /></div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.5rem", background: "#fafafa" }}>
        <div>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500, margin: "0 0 0.2rem" }}>Estimated Total</p>
          <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#8368ef", margin: 0 }}>{fmt(pricing.total)}</p>
        </div>
        <button type="button" onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.875rem", background: "#8368ef", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: 500, cursor: "pointer", fontSize: "0.8125rem" }}>
          {showPanel ? "Hide" : "View"} Details <ChevD r={showPanel} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PaxEnquiryPage() {
  const params      = useParams();
  const router      = useRouter();
  const searchParams = useSearchParams();

  const locale   = params?.locale  ?? "en";
  const country  = params?.country ?? "in";
  const venueId  = params?.id      ?? "";

  const ctx = useMemo(() => ({
    eventType: searchParams.get("eventType") ?? "",
    date:      searchParams.get("date")      ?? "",
    shift:     searchParams.get("shift")     ?? "",
    guests:    parseInt(searchParams.get("guests") ?? "0", 10),
    venueName: searchParams.get("venueName") ?? "",
  }), [searchParams]);

  // ── core state ──────────────────────────────────────────────────────────────
  const [step,          setStep]          = useState(1);
  const [menuTab,       setMenuTab]       = useState("packages");
  const [adultCount,    setAdultCount]    = useState(ctx.guests || 0);
  const [childCount,    setChildCount]    = useState(0);
  // data
  const [packagesList,    setPackagesList]    = useState([]);
  const [menuCategories,  setMenuCategories]  = useState([]);
  const [menuItems,       setMenuItems]       = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  // selection
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [pkgSelections,   setPkgSelections]   = useState({});
  const [customMenuItems, setCustomMenuItems] = useState([]);
  // requirements
  const [dietary,      setDietary]      = useState({});
  const [allergies,    setAllergies]    = useState({});
  const [otherAllergy, setOtherAllergy] = useState("");
  const [servingPref,  setServingPref]  = useState("");
  const [notes,        setNotes]        = useState("");
  // contact
  const [contactName,  setContactName]  = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactOrg,   setContactOrg]   = useState("");
  const [errors,       setErrors]       = useState({});
  // modals
  const [showPkgModal,    setShowPkgModal]    = useState(false);
  const [pendingPkg,      setPendingPkg]      = useState(null);
  const [tempPkgSel,      setTempPkgSel]      = useState({});
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [tempCustomItems, setTempCustomItems] = useState([]);
  const [confirm,         setConfirm]         = useState(null);
  // success
  const [showSuccess, setShowSuccess] = useState(false);
  const [enquiryRef,  setEnquiryRef]  = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  // draft / mobile
  const [hasDraft,        setHasDraft]        = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [isMobile,        setIsMobile]        = useState(false);

  // ── effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    try {
      const r = localStorage.getItem(DRAFT_KEY);
      if (r) { const d = JSON.parse(r); if (d.venueId === venueId) setHasDraft(true); }
    } catch { /* ignore */ }
  }, [venueId]);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("userProfile") || "{}");
      if (p.name)  setContactName(p.name);
      if (p.email) setContactEmail(p.email);
      if (p.phone) setContactPhone(p.phone);
    } catch { /* ignore */ }
  }, []);

  // Load mock data on mount
  useEffect(() => {
    setLoadingPackages(true);
    loadMockData().then(({ packages, categories, items }) => {
      setPackagesList(packages);
      setMenuCategories(categories);
      setMenuItems(items);
    }).finally(() => setLoadingPackages(false));
  }, [venueId]);

  // ── pricing ─────────────────────────────────────────────────────────────────
  const pricing = useMemo(() => {
    let foodTotal = 0, foodDesc = "";
    if (menuTab === "packages" && selectedPackage) {
      foodTotal = (selectedPackage.package_amount || 0) * adultCount;
      foodDesc  = `${selectedPackage.package_name} (${adultCount} guests)`;
    } else if (menuTab === "custom" && customMenuItems.length > 0) {
      foodDesc = `Custom Menu (${customMenuItems.length} items)`;
    }
    const guestCount    = adultCount + childCount;
    const addonSummary  = 0;
    const minimumCharge = guestCount > 0 && guestCount < MINIMUM_PAX && foodTotal > 0
      ? (MINIMUM_PAX - guestCount) * (selectedPackage?.package_amount || 0) : 0;
    const subtotal = foodTotal + addonSummary + minimumCharge;
    const tax5     = foodTotal * FOOD_TAX;
    const tax18    = addonSummary * ADDON_TAX;
    const total    = subtotal + tax5 + tax18;
    return { foodDesc, foodTotal, addonSummary, minimumCharge, subtotal, tax5, tax18, total };
  }, [adultCount, childCount, menuTab, selectedPackage, customMenuItems]);

  // ── draft ────────────────────────────────────────────────────────────────────
  const saveDraft = useCallback(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ venueId, step, menuTab, adultCount, childCount, selectedPackage, pkgSelections, customMenuItems, dietary, allergies, otherAllergy, servingPref, notes, contactName, contactEmail, contactPhone, contactOrg, ts: Date.now() }));
    setHasDraft(true);
  }, [venueId, step, menuTab, adultCount, childCount, selectedPackage, pkgSelections, customMenuItems, dietary, allergies, otherAllergy, servingPref, notes, contactName, contactEmail, contactPhone, contactOrg]);

  const loadDraft = () => {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
      if (!d.venueId) return;
      if (d.step)           setStep(d.step);
      if (d.menuTab)        setMenuTab(d.menuTab);
      if (d.adultCount)     setAdultCount(d.adultCount);
      if (d.childCount)     setChildCount(d.childCount);
      if (d.selectedPackage) setSelectedPackage(d.selectedPackage);
      if (d.pkgSelections)  setPkgSelections(d.pkgSelections);
      if (d.customMenuItems) setCustomMenuItems(d.customMenuItems);
      if (d.dietary)        setDietary(d.dietary);
      if (d.allergies)      setAllergies(d.allergies);
      if (d.otherAllergy)   setOtherAllergy(d.otherAllergy);
      if (d.servingPref)    setServingPref(d.servingPref);
      if (d.notes)          setNotes(d.notes);
      if (d.contactName)    setContactName(d.contactName);
      if (d.contactEmail)   setContactEmail(d.contactEmail);
      if (d.contactPhone)   setContactPhone(d.contactPhone);
      if (d.contactOrg)     setContactOrg(d.contactOrg);
      setHasDraft(false);
    } catch { /* ignore */ }
  };

  const dismissDraft = () => { localStorage.removeItem(DRAFT_KEY); setHasDraft(false); };

  // ── navigation ───────────────────────────────────────────────────────────────
  const validateStep = (s) => {
    if (s === 4) {
      const e = {};
      if (!contactName.trim())  e.name  = "Name is required";
      if (!contactEmail.trim()) e.email = "Email is required";
      if (!contactPhone.trim()) e.phone = "Phone is required";
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    return true;
  };
  const goNext = () => { if (!validateStep(step)) return; setErrors({}); setStep(s => Math.min(5, s + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goBack = () => { setStep(s => Math.max(1, s - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // ── tab switch ────────────────────────────────────────────────────────────────
  const handleTabSwitch = (tab) => {
    if (tab === menuTab) return;
    const hasSel = menuTab === "packages" ? !!selectedPackage : customMenuItems.length > 0;
    if (hasSel) {
      setConfirm({ title: "Switch Menu Mode?", message: "Switching will clear your current menu selection.", onConfirm: () => { setMenuTab(tab); setSelectedPackage(null); setPkgSelections({}); setCustomMenuItems([]); setConfirm(null); } });
    } else { setMenuTab(tab); }
  };

  // ── package modal ─────────────────────────────────────────────────────────────
  const openPackageModal = (pkg) => {
    if (selectedPackage && selectedPackage.id !== pkg.id) {
      setConfirm({ title: "Switch Package?", message: `Switch to "${pkg.package_name}"? Current customizations will be cleared.`, onConfirm: () => { setPendingPkg(pkg); setTempPkgSel({}); setShowPkgModal(true); setConfirm(null); } });
    } else {
      setPendingPkg(pkg);
      setTempPkgSel(selectedPackage?.id === pkg.id ? { ...pkgSelections } : {});
      setShowPkgModal(true);
    }
  };
  const confirmPkg = () => { setSelectedPackage(pendingPkg); setPkgSelections(tempPkgSel); setShowPkgModal(false); setPendingPkg(null); };
  const cancelPkg  = () => { setConfirm({ title: "Cancel Selection?", message: "Discard your current selections?", onConfirm: () => { setShowPkgModal(false); setPendingPkg(null); setConfirm(null); } }); };

  // ── custom menu modal ─────────────────────────────────────────────────────────
  const openCustomMenuModal = () => { setTempCustomItems([...customMenuItems]); setShowCustomModal(true); };
  const confirmCustom       = () => { setCustomMenuItems([...tempCustomItems]); setShowCustomModal(false); };

  // ── submit (mock) ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const ref = genRef();
    try {
      await submitMockEnquiry({
        venue_id:     venueId,
        event_type:   ctx.eventType,
        event_date:   ctx.date,
        shift:        ctx.shift,
        adult_count:  adultCount,
        child_count:  childCount,
        menu_mode:    menuTab,
        package_id:   selectedPackage?.id,
        custom_items: customMenuItems.map(i => i.id),
        dietary:      Object.entries(dietary).filter(([, v]) => v).map(([k]) => k),
        allergies:    Object.entries(allergies).filter(([, v]) => v).map(([k]) => k),
        other_allergy: otherAllergy,
        serving_pref: servingPref,
        notes,
        contact_name:  contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_org:   contactOrg,
        _ref: ref,
      });
      setEnquiryRef(ref);
      localStorage.removeItem(DRAFT_KEY);
      setShowSuccess(true);
    } catch (err) {
      console.error("PAX submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => { setShowSuccess(false); router.push(`/${locale}/${country}`); };

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input, textarea { outline: none; }
        input:focus, textarea:focus { border-color: #8368ef !important; box-shadow: 0 0 0 3px rgba(131,104,239,0.12); }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 1; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
        {/* Top bar */}
        <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "1rem 0" }}>
          <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <button type="button" onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: "0.375rem 0.5rem", borderRadius: "0.375rem", fontSize: "0.9375rem" }}><ChevL /> Back</button>
            <div>
              <h1 style={{ fontWeight: 700, color: "#111827", margin: 0, fontSize: "1.125rem" }}>Event Booking Enquiry</h1>
              {ctx.venueName && <p style={{ color: "#6b7280", margin: 0, fontSize: "0.8125rem" }}>{ctx.venueName}</p>}
            </div>
          </div>
        </div>

        {/* Draft banner */}
        {hasDraft && (
          <div style={{ background: "#eff6ff", borderBottom: "1px solid #bfdbfe" }}>
            <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0.625rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#1e40af", fontSize: "0.9375rem" }}><InfoIco s={15} /> You have a saved draft for this venue.</div>
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button type="button" onClick={loadDraft} style={{ padding: "0.375rem 0.875rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "0.375rem", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>Load Draft</button>
                <button type="button" onClick={dismissDraft} style={{ padding: "0.375rem 0.875rem", background: "white", color: "#374151", border: "1px solid #d1d5db", borderRadius: "0.375rem", cursor: "pointer", fontSize: "0.875rem" }}>Dismiss</button>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div style={{ background: "white", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 1.5rem" }}>
            <ProgressSteps current={step} />
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "2rem 1.5rem", paddingBottom: isMobile ? "6rem" : "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "2rem", alignItems: "start" }}>
            {/* Left: step content */}
            <div>
              <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "2rem", marginBottom: "1.5rem" }}>
                {step === 1 && <StepEventDetails ctx={ctx} adultCount={adultCount} setAdultCount={setAdultCount} childCount={childCount} setChildCount={setChildCount} />}
                {step === 2 && <StepFoodMenu menuTab={menuTab} packagesList={packagesList} loadingPackages={loadingPackages} selectedPackage={selectedPackage} adultCount={adultCount} openPackageModal={openPackageModal} customMenuItems={customMenuItems} openCustomMenuModal={openCustomMenuModal} removeCustomItem={(id) => setCustomMenuItems(p => p.filter(i => i.id !== id))} onSwitchTab={handleTabSwitch} />}
                {step === 3 && <StepRequirements dietary={dietary} setDietary={setDietary} allergies={allergies} setAllergies={setAllergies} otherAllergy={otherAllergy} setOtherAllergy={setOtherAllergy} servingPref={servingPref} setServingPref={setServingPref} notes={notes} setNotes={setNotes} />}
                {step === 4 && <StepContact name={contactName} setName={setContactName} email={contactEmail} setEmail={setContactEmail} phone={contactPhone} setPhone={setContactPhone} org={contactOrg} setOrg={setContactOrg} errors={errors} />}
                {step === 5 && <StepReview ctx={ctx} adultCount={adultCount} childCount={childCount} menuTab={menuTab} selectedPackage={selectedPackage} customMenuItems={customMenuItems} dietary={dietary} allergies={allergies} otherAllergy={otherAllergy} servingPref={servingPref} notes={notes} name={contactName} email={contactEmail} phone={contactPhone} org={contactOrg} pricing={pricing} />}
              </div>

              {/* Nav buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <button type="button" onClick={goBack} disabled={step === 1} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", background: "white", border: "1px solid #d1d5db", borderRadius: "0.375rem", color: "#374151", fontWeight: 500, cursor: step === 1 ? "not-allowed" : "pointer", opacity: step === 1 ? 0.5 : 1, fontSize: "0.9375rem" }}><ChevL /> Back</button>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {step < 5 && <button type="button" onClick={saveDraft} style={{ padding: "0.625rem 1.25rem", background: "white", border: "1px solid #d1d5db", color: "#374151", borderRadius: "0.375rem", fontWeight: 500, cursor: "pointer", fontSize: "0.9375rem" }}>Save Draft</button>}
                  {step < 5 ? (
                    <button type="button" onClick={goNext} style={{ padding: "0.625rem 1.5rem", background: "#8368ef", color: "white", border: "none", borderRadius: "0.375rem", fontWeight: 600, cursor: "pointer", fontSize: "0.9375rem" }}>Next →</button>
                  ) : (
                    <button type="button" onClick={handleSubmit} disabled={submitting} style={{ padding: "0.625rem 1.75rem", background: submitting ? "#a78bfa" : "#8368ef", color: "white", border: "none", borderRadius: "0.375rem", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: "0.9375rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {submitting && <span style={{ width: "1rem", height: "1rem", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
                      {submitting ? "Submitting…" : "Submit Enquiry"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: pricing (desktop) */}
            {!isMobile && (
              <div style={{ position: "sticky", top: "6rem" }}>
                <PricingCard pricing={pricing} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      {isMobile && <MobileBottomBar pricing={pricing} showPanel={showMobilePanel} onToggle={() => setShowMobilePanel(p => !p)} />}

      {/* Modals */}
      {showPkgModal && pendingPkg && <PackageModal pkg={pendingPkg} menuCategories={menuCategories} menuItems={menuItems} selections={tempPkgSel} setSelections={setTempPkgSel} onCancel={cancelPkg} onConfirm={confirmPkg} />}
      {showCustomModal && <CustomMenuModal menuCategories={menuCategories} menuItems={menuItems} selected={tempCustomItems} setSelected={setTempCustomItems} onClose={() => setShowCustomModal(false)} onConfirm={confirmCustom} isMobile={isMobile} />}
      {confirm && <ConfirmDialog title={confirm.title} message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      {showSuccess && <SuccessModal refNum={enquiryRef} onClose={handleSuccessClose} />}
    </>
  );
}
