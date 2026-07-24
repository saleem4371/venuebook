"use client";

import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { loadVenues } from "@/services/venue_details.service";

// ─── Mock Data (unchanged) ────────────────────────────────────────────────────
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
  { id: "pkg_silver", package_name: "Silver Banquet", package_amount: 850, package_food_type: 1, is_popular: false, categories: [{ id: 1, name: "Starters & Soups" }, { id: 3, name: "Breads & Rice" }, { id: 4, name: "Desserts" }] },
  { id: "pkg_gold", package_name: "Gold Feast", package_amount: 1200, package_food_type: 1, is_popular: true, categories: [{ id: 1, name: "Starters & Soups" }, { id: 2, name: "Main Course" }, { id: 3, name: "Breads & Rice" }, { id: 4, name: "Desserts" }] },
  { id: "pkg_platinum", package_name: "Platinum Grand", package_amount: 1800, package_food_type: 1, is_popular: false, categories: MOCK_CATEGORIES },
  { id: "pkg_nonveg", package_name: "Non-Veg Special", package_amount: 1500, package_food_type: 2, is_popular: false, categories: [{ id: 1, name: "Starters & Soups" }, { id: 2, name: "Main Course" }, { id: 3, name: "Breads & Rice" }, { id: 4, name: "Desserts" }, { id: 5, name: "Beverages" }] },
  { id: "pkg_budget", package_name: "Budget Bliss", package_amount: 650, package_food_type: 1, is_popular: false, categories: [{ id: 2, name: "Main Course" }, { id: 3, name: "Breads & Rice" }] },
];
function loadMockData() { return new Promise(r => setTimeout(() => r({ packages: MOCK_PACKAGES, categories: MOCK_CATEGORIES, items: MOCK_ITEMS }), 600)); }
function submitMockEnquiry(p) { return new Promise(r => setTimeout(() => r({ success: true }), 1200)); }

// ─── Constants (unchanged) ────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Event Details", short: "Details" },
  { id: 2, label: "Food Menu",     short: "Menu"    },
  { id: 3, label: "Requirements",  short: "Reqs"    },
  { id: 4, label: "Contact Info",  short: "Contact" },
  { id: 5, label: "Review",        short: "Review"  },
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
const MINIMUM_PAX = 50;
const FOOD_TAX = 0.05;
const ADDON_TAX = 0.18;
const DRAFT_KEY = "paxBookingDraft";

// ─── Helpers (unchanged) ──────────────────────────────────────────────────────
function fmt(n) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0); }
function fmtDate(d) { if (!d) return ""; try { return new Date(d).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); } catch { return d; } }
function genRef() { return "VB-PAX-" + Math.random().toString(36).substring(2, 8).toUpperCase(); }

// ─── Design Tokens ────────────────────────────────────────────────────────────
const P = "var(--pax-p)";     // violet-600 — venue primary
const PH = "var(--pax-ph)";   // violet-700 — hover
const PL = "var(--pax-pl)";   // violet-100 — light bg
const PLL = "var(--pax-pll)"; // violet-50  — xlight bg
const PR = "var(--pax-pr)";   // ring

const card = { background:"var(--pax-card)", border:"1px solid var(--pax-brd)", borderRadius:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" };
const inputBase = { width:"100%", height:"48px", padding:"0 14px", border:"1.5px solid var(--pax-brd)", borderRadius:"12px", fontSize:"0.9375rem", color:"var(--pax-t1)", background:"var(--pax-card)", transition:"border-color 0.15s, box-shadow 0.15s", fontFamily:"inherit" };
const labelBase = { display:"block", fontSize:"0.8125rem", fontWeight:600, color:"var(--pax-t2)", marginBottom:"6px", letterSpacing:"0.01em" };

// ─── Tabler Icons (inline SVG) ────────────────────────────────────────────────
const Ico = ({ d, d2, d3, circle, size=20, color="currentColor", sw=1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    {circle && <circle cx={circle[0]} cy={circle[1]} r={circle[2]}/>}
    <path d={d}/>
    {d2 && <path d={d2}/>}
    {d3 && <path d={d3}/>}
  </svg>
);

const ICheck     = (p={}) => <Ico {...p} d="M5 12l5 5l10-10"/>;
const IChevL     = (p={}) => <Ico {...p} d="M15 6l-6 6l6 6"/>;
const IChevR     = (p={}) => <Ico {...p} d="M9 6l6 6l-6 6"/>;
const IChevD     = ({rot,...p}) => <span style={{display:"inline-flex",transition:"transform 0.25s",transform:rot?"rotate(180deg)":"none"}}><Ico {...p} d="M6 9l6 6l6-6"/></span>;
const IClose     = (p={}) => <Ico {...p} d="M18 6L6 18M6 6l12 12"/>;
const ISearch    = (p={}) => <Ico {...p} circle={[10,10,7]} d="M21 21l-6-6"/>;
const IInfo      = (p={}) => <Ico {...p} circle={[12,12,9]} d="M12 8h.01M11 12h1v4h1"/>;
const IWarn      = (p={}) => <Ico {...p} d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" d2="M12 9v4" d3="M12 17h.01"/>;
const IUtensils  = (p={}) => <Ico {...p} d="M7 3v18M11 7L7 3L3 7M17 3a4 4 0 010 8v10"/>;
const ICalendar  = (p={}) => <Ico {...p} d="M4 7a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7zM16 3v4M8 3v4M4 11h16M11 15h1M12 15v3"/>;
const IUsers     = (p={}) => <Ico {...p} circle={[9,7,4]} d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85"/>;
const IPin       = (p={}) => <Ico {...p} circle={[12,11,3]} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>;
const ICheckCirc = (p={}) => <Ico {...p} circle={[12,12,9]} d="M9 12l2 2l4-4"/>;
const ITag       = (p={}) => <Ico {...p} d="M7.5 7.5m-1 0a1 1 0 102 0 1 1 0 10-2 0M3 6a3 3 0 013-3h3.586a1 1 0 01.707.293l7.414 7.414a2 2 0 010 2.828l-4.586 4.586a2 2 0 01-2.828 0L3.293 10.707A1 1 0 013 10V6z"/>;
const IReceipt   = (p={}) => <Ico {...p} d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16l-3-2l-2 2l-2-2l-2 2l-2-2l-3 2zM9 7h6M9 11h6M9 15h4"/>;
const IArrowR    = (p={}) => <Ico {...p} d="M5 12h14M13 18l6-6M13 6l6 6"/>;
const IPlus      = (p={}) => <Ico {...p} d="M12 5v14M5 12h14"/>;
const IMinus     = (p={}) => <Ico {...p} d="M5 12h14"/>;
const IStar      = (p={}) => <Ico {...p} d="M12 17.75l-6.172 3.245l1.179-6.873l-5-4.867l6.9-1l3.086-6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>;
const ILeaf      = (p={}) => <Ico {...p} d="M5 21c.5-4.5 2.5-8 7-10M9 18c6.218 0 10.5-3.288 11-12v-2h-4.014c-9 0-11.986 4-12 9c0 1 0 3 2 5h3z"/>;
const IMail      = (p={}) => <Ico {...p} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 7l9 6l9-6"/>;
const IPhone     = (p={}) => <Ico {...p} d="M5 4h4l2 5l-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 014 6a2 2 0 012-2"/>;
const IBuild     = (p={}) => <Ico {...p} d="M3 21h18M5 21V7l7-4l7 4v14M9 9v.01M9 12v.01M9 15v.01M15 9v.01M15 12v.01M15 15v.01M12 21v-4a1 1 0 011-1h2a1 1 0 011 1v4"/>;
const IFile      = (p={}) => <Ico {...p} d="M14 3v4a1 1 0 001 1h4M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2zM9 9h1M9 13h6M9 17h6"/>;

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  :root {
    --pax-bg:#fff; --pax-card:#fff; --pax-t1:#111827; --pax-t2:#374151;
    --pax-t3:#6B7280; --pax-t4:#9CA3AF; --pax-brd:#E5E7EB; --pax-brd2:#F0EFFE;
    --pax-brd3:#F3F4F6; --pax-muted:#F9FAFB; --pax-muted2:#F3F4F6;
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
  @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
  @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
  @keyframes shimmer { from { background-position:-200% 0; } to { background-position:200% 0; } }

  *,*::before,*::after { box-sizing:border-box; }
  input,textarea,select,button { font-family:inherit; }
  input:focus,textarea:focus,select:focus { outline:none; }
  button:focus-visible { outline:2px solid var(--pax-p); outline-offset:2px; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { opacity:1; }
  input[type=checkbox],input[type=radio] { accent-color:var(--pax-p); }

  .pax-card { animation: fadeUp 0.28s cubic-bezier(0.16,1,0.3,1); }
  .pax-modal { animation: scaleIn 0.22s cubic-bezier(0.16,1,0.3,1); }
  .pax-sheet { animation: slideUp 0.32s cubic-bezier(0.16,1,0.3,1); }

  .pkg-card { transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s; }
  .pkg-card:hover { box-shadow: 0 6px 24px var(--pax-pr) !important; transform: translateY(-2px); }

  .pax-btn-primary { transition: background 0.15s, box-shadow 0.15s, transform 0.1s; }
  .pax-btn-primary:hover:not(:disabled) { box-shadow: 0 4px 14px rgba(124,58,237,0.35); transform: translateY(-1px); }
  .pax-btn-primary:active:not(:disabled) { transform: translateY(0); }

  .pax-input:focus { border-color: var(--pax-p) !important; box-shadow: 0 0 0 3px var(--pax-pr) !important; }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--pax-brd); border-radius:3px; }
`;


// ─── ProgressSteps ────────────────────────────────────────────────────────────
function ProgressSteps({ current, isMobile }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"center", padding: isMobile ? "1rem 0.75rem" : "1.25rem 2rem", gap:0, overflowX:"auto" }}>
      {STEPS.map((step, i) => {
        const done = current > step.id, active = current === step.id;
        return (
          <Fragment key={step.id}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.375rem", flexShrink:0 }}>
              <div style={{
                width: isMobile ? "1.875rem" : "2.25rem",
                height: isMobile ? "1.875rem" : "2.25rem",
                borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:700, fontSize: isMobile ? "0.75rem" : "0.875rem",
                background: done ? "#059669" : active ? P : "var(--pax-muted2)",
                color: (done || active) ? "var(--pax-card)" : "var(--pax-t4)",
                boxShadow: active ? `0 0 0 4px ${PR}, 0 0 0 7px ${PLL}` : "none",
                transition:"all 0.3s cubic-bezier(0.16,1,0.3,1)",
                position:"relative", zIndex:1,
              }}>
                {done ? <ICheck size={isMobile ? 12 : 14} color="var(--pax-card)" sw={2.5}/> : step.id}
              </div>
              <span style={{
                fontSize: isMobile ? "0.625rem" : "0.6875rem",
                fontWeight: active ? 700 : 400,
                color: active ? P : done ? "#059669" : "var(--pax-t4)",
                whiteSpace:"nowrap",
                letterSpacing: active ? "0.02em" : 0,
                transition:"color 0.3s",
              }}>{isMobile ? step.short : step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex:1, height:"2px", marginTop: isMobile ? "0.9375rem" : "1.125rem",
                background: done ? "#059669" : "var(--pax-brd)",
                transition:"background 0.4s",
                minWidth:"16px", maxWidth:"64px", flexShrink:1,
              }}/>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
function SectionCard({ icon, title, description, children, last }) {
  return (
    <div style={{ ...card, padding:"1.5rem", marginBottom: last ? 0 : "1rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"0.875rem", marginBottom: description ? "1.25rem" : "1rem" }}>
        {icon && (
          <div style={{ width:"2.5rem", height:"2.5rem", borderRadius:"10px", background:P, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {icon}
          </div>
        )}
        <div>
          <h3 style={{ fontWeight:700, color:"var(--pax-t1)", fontSize:"1.0625rem", margin:0, lineHeight:1.3 }}>{title}</h3>
          {description && <p style={{ fontSize:"0.875rem", color:"var(--pax-t3)", margin:"0.25rem 0 0", lineHeight:1.5 }}>{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldWrap({ label, required, error, hint, children }) {
  return (
    <div>
      {label && (
        <label style={labelBase}>
          {label}{required && <span style={{ color:"#EF4444", marginLeft:"2px" }}>*</span>}
        </label>
      )}
      {children}
      {error && (
        <div style={{ display:"flex", alignItems:"center", gap:"4px", marginTop:"5px", color:"#DC2626", fontSize:"0.8125rem" }}>
          <IWarn size={13} color="#DC2626" sw={2}/> {error}
        </div>
      )}
      {hint && !error && <p style={{ fontSize:"0.8125rem", color:"var(--pax-t4)", marginTop:"5px" }}>{hint}</p>}
    </div>
  );
}

function PaxInput({ label, required, error, hint, icon, ...props }) {
  return (
    <FieldWrap label={label} required={required} error={error} hint={hint}>
      <div style={{ position:"relative" }}>
        {icon && <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"var(--pax-t4)", display:"flex", pointerEvents:"none" }}>{icon}</span>}
        <input
          {...props}
          className="pax-input"
          style={{ ...inputBase, paddingLeft: icon ? "42px" : "14px", borderColor: error ? "#FCA5A5" : "var(--pax-brd)", ...props.style }}
        />
      </div>
    </FieldWrap>
  );
}

function BtnPrimary({ children, disabled, loading, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className="pax-btn-primary"
      style={{
        display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"8px",
        padding:"0 1.75rem", height:"48px", borderRadius:"12px",
        background: (disabled || loading) ? "#C4B5FD" : `linear-gradient(135deg, ${P}, ${PH})`,
        color:"var(--pax-card)", border:"none", fontWeight:600, fontSize:"0.9375rem",
        cursor: (disabled || loading) ? "not-allowed" : "pointer",
        boxShadow: (disabled || loading) ? "none" : "0 1px 4px rgba(124,58,237,0.25)",
        letterSpacing:"0.01em", whiteSpace:"nowrap",
        ...(props.style || {}),
      }}
    >
      {loading && <span style={{ width:"16px", height:"16px", border:"2px solid rgba(255,255,255,0.35)", borderTopColor:"var(--pax-card)", borderRadius:"50%", animation:"spin 0.7s linear infinite", flexShrink:0 }}/>}
      {children}
    </button>
  );
}

function BtnSecondary({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"8px",
        padding:"0 1.25rem", height:"48px", borderRadius:"12px",
        background:"var(--pax-card)", border:"1.5px solid var(--pax-brd)", color:"var(--pax-t2)",
        fontWeight:500, fontSize:"0.9375rem", cursor:"pointer",
        transition:"border-color 0.15s, background 0.15s", whiteSpace:"nowrap",
        ...(props.style || {}),
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="var(--pax-t4)"; e.currentTarget.style.background="var(--pax-muted)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="var(--pax-brd)"; e.currentTarget.style.background="var(--pax-card)"; }}
    >
      {children}
    </button>
  );
}

function BtnGhost({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        display:"inline-flex", alignItems:"center", gap:"6px",
        padding:"0 0.75rem", height:"40px", borderRadius:"8px",
        background:"transparent", border:"none", color:"var(--pax-t3)",
        fontWeight:500, fontSize:"0.9375rem", cursor:"pointer",
        transition:"color 0.15s, background 0.15s",
        ...(props.style || {}),
      }}
      onMouseEnter={e => { e.currentTarget.style.color="var(--pax-t2)"; e.currentTarget.style.background="var(--pax-muted2)"; }}
      onMouseLeave={e => { e.currentTarget.style.color="var(--pax-t3)"; e.currentTarget.style.background="transparent"; }}
    >
      {children}
    </button>
  );
}

function Divider() { return <div style={{ height:"1px", background:"var(--pax-brd3)", margin:"1.25rem 0" }}/>; }

function InfoBanner({ color="blue", icon, children }) {
  const map = { blue:["#EFF6FF","#BFDBFE","#1E40AF"], amber:["#FFFBEB","#FDE68A","#92400E"], green:["#ECFDF5","#A7F3D0","#065F46"], red:["#FEF2F2","#FECACA","#991B1B"] };
  const [bg,border,text] = map[color] || map.blue;
  return (
    <div style={{ display:"flex", gap:"10px", padding:"0.875rem 1rem", background:bg, border:`1px solid ${border}`, borderRadius:"12px", alignItems:"flex-start" }}>
      <span style={{ flexShrink:0, marginTop:"1px", color:text }}>{icon || <IInfo size={16} color={text}/>}</span>
      <p style={{ color:text, margin:0, fontSize:"0.875rem", lineHeight:1.55 }}>{children}</p>
    </div>
  );
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────
function SummaryCard({ pricing, ctx, coverImage, selectedPackage, menuTab, customMenuItems, adultCount }) {
  const { foodTotal, addonSummary: addonAmt, minimumCharge, subtotal, tax5, tax18, total } = pricing;
  const hasPrice = total > 0;
  const [foodOpen, setFoodOpen] = useState(true);

  return (
    <div style={{ ...card, overflow:"hidden" }}>

      {/* ── Header: venue photo if available, else gradient fallback ── */}
      <div style={{ position:"relative", height:"128px", overflow:"hidden",
        background:"linear-gradient(135deg, #3B0764 0%, #5B21B6 45%, #7C3AED 100%)" }}>
        {/* Real venue photo */}
        {coverImage && (
          <img src={coverImage} alt={ctx.venueName || "Venue"}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}/>
        )}
        {/* Gradient overlay — stronger when no photo so text stays readable */}
        <div style={{ position:"absolute", inset:0,
          background: coverImage
            ? "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)" }}/>
        {/* Gradient-only decorative blobs (hidden when photo present) */}
        {!coverImage && <>
          <div style={{ position:"absolute", top:"-20px", right:"-20px", width:"110px", height:"110px",
            borderRadius:"50%", background:"rgba(167,139,250,0.18)" }}/>
          <div style={{ position:"absolute", bottom:"-30px", left:"10px", width:"90px", height:"90px",
            borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>
        </>}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0.75rem 1.25rem" }}>
          {ctx.venueName && (
            <p style={{ fontSize:"0.6875rem", color:"rgba(255,255,255,0.7)", margin:"0 0 3px", fontWeight:500, letterSpacing:"0.02em" }}>
              {ctx.venueName}
            </p>
          )}
          <p style={{ fontSize:"1.0625rem", fontWeight:700, color:"#fff", margin:0, lineHeight:1.2 }}>
            {ctx.eventType || "Event Enquiry"}
          </p>
        </div>
      </div>

      <div style={{ padding:"1.125rem 1.25rem 1.125rem" }}>

        {/* Context chips row */}
        {(ctx.shift || adultCount > 0 || ctx.date) && (
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"1rem",
            paddingBottom:"0.875rem", borderBottom:"1px solid var(--pax-brd3)" }}>
            {ctx.date && (
              <span style={{ fontSize:"0.6875rem", fontWeight:500, padding:"3px 10px",
                background:"var(--pax-muted)", color:"var(--pax-t3)", borderRadius:"9999px",
                border:"1px solid var(--pax-brd)" }}>{fmtDate(ctx.date)}</span>
            )}
            {ctx.shift && (
              <span style={{ fontSize:"0.6875rem", fontWeight:600, padding:"3px 10px",
                background:"#F0FDF4", color:"#15803D", borderRadius:"9999px",
                border:"1px solid #BBF7D0" }}>{ctx.shift}</span>
            )}
            {adultCount > 0 && (
              <span style={{ fontSize:"0.6875rem", fontWeight:600, padding:"3px 10px",
                background:"#F0F9FF", color:"#0369A1", borderRadius:"9999px",
                border:"1px solid #BAE6FD" }}>{adultCount} guests</span>
            )}
          </div>
        )}

        {/* ── Breakdown ── */}
        {!hasPrice ? (
          <div style={{ textAlign:"center", padding:"1.5rem 0" }}>
            <div style={{ width:"2.75rem", height:"2.75rem", borderRadius:"50%", background:PLL,
              margin:"0 auto 0.625rem", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <IReceipt size={20} color={P} sw={1.75}/>
            </div>
            <p style={{ fontWeight:600, color:"var(--pax-t2)", margin:"0 0 0.25rem", fontSize:"0.9375rem" }}>No price yet</p>
            <p style={{ color:"var(--pax-t4)", fontSize:"0.8125rem", margin:0, lineHeight:1.5 }}>
              Select a package and add guests to see pricing
            </p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>

            {/* Food breakdown rows — flat, like checkout (no duplicate group total) */}
            {foodTotal > 0 && (
              <>
                {/* Package / food line */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline",
                  padding:"0.5rem 0", borderBottom:"1px solid var(--pax-brd3)" }}>
                  <span style={{ fontSize:"0.875rem", color:"var(--pax-t2)" }}>
                    {selectedPackage
                      ? `${selectedPackage.package_name} × ${adultCount}`
                      : menuTab === "custom"
                        ? `Custom Menu (${customMenuItems.length} items)`
                        : "Food Package"}
                  </span>
                  <span style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--pax-t1)", flexShrink:0 }}>
                    {fmt(foodTotal)}
                  </span>
                </div>

                {/* Min charge if applicable */}
                {minimumCharge > 0 && (
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline",
                    padding:"0.5rem 0", borderBottom:"1px solid var(--pax-brd3)" }}>
                    <span style={{ fontSize:"0.8125rem", color:"var(--pax-t4)",
                      paddingLeft:"0.625rem", borderLeft:"2px solid var(--pax-brd)" }}>
                      Min. charge ({MINIMUM_PAX} guest min)
                    </span>
                    <span style={{ fontSize:"0.8125rem", color:"var(--pax-t3)", flexShrink:0 }}>{fmt(minimumCharge)}</span>
                  </div>
                )}

                {/* Add-ons */}
                {addonAmt > 0 && (
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline",
                    padding:"0.5rem 0", borderBottom:"1px solid var(--pax-brd3)" }}>
                    <span style={{ fontSize:"0.875rem", color:"var(--pax-t2)" }}>Add-ons</span>
                    <span style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--pax-t1)", flexShrink:0 }}>{fmt(addonAmt)}</span>
                  </div>
                )}

                {/* GST rows — indented like checkout sub-items */}
                {tax5 > 0 && (
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline",
                    padding:"0.4375rem 0", borderBottom:"1px solid var(--pax-brd3)" }}>
                    <span style={{ fontSize:"0.8125rem", color:"var(--pax-t4)" }}>GST 5% (Food)</span>
                    <span style={{ fontSize:"0.8125rem", color:"var(--pax-t3)", flexShrink:0 }}>{fmt(tax5)}</span>
                  </div>
                )}
                {tax18 > 0 && (
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline",
                    padding:"0.4375rem 0", borderBottom:"1px solid var(--pax-brd3)" }}>
                    <span style={{ fontSize:"0.8125rem", color:"var(--pax-t4)" }}>GST 18% (Add-ons)</span>
                    <span style={{ fontSize:"0.8125rem", color:"var(--pax-t3)", flexShrink:0 }}>{fmt(tax18)}</span>
                  </div>
                )}
              </>
            )}

            {/* Total — border-t-2, bold black exactly like checkout */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              gap:"0.5rem", paddingTop:"0.875rem", marginTop:"0.375rem",
              borderTop:"2px solid var(--pax-brd)" }}>
              <span style={{ fontSize:"0.9375rem", fontWeight:700, color:"var(--pax-t1)" }}>Estimated Total</span>
              <span style={{ fontSize:"1.25rem", fontWeight:800, color:"var(--pax-t1)", flexShrink:0 }}>{fmt(total)}</span>
            </div>
          </div>
        )}

        {/* Estimate note */}
        <div style={{ marginTop:"1rem", display:"flex", gap:"8px", alignItems:"flex-start",
          padding:"0.75rem 0.875rem", background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:"10px" }}>
          <IInfo size={14} color="#1E40AF" sw={2} style={{ flexShrink:0, marginTop:"1px" }}/>
          <p style={{ color:"#1E40AF", margin:0, fontSize:"0.8125rem", lineHeight:1.5 }}>
            Estimate only. Final pricing confirmed in your quote.
          </p>
        </div>
      </div>
    </div>
  );
}


// ─── Step 1 — Event Details ───────────────────────────────────────────────────
function StepEventDetails({ ctx, adultCount, setAdultCount, childCount, setChildCount }) {
  const total = adultCount + childCount;
  const belowMin = total > 0 && total < MINIMUM_PAX;

  const CounterRow = ({ label, sub, value, onChange }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.125rem 0", borderBottom:"1px solid var(--pax-brd3)" }}>
      <div>
        <p style={{ fontWeight:600, color:"var(--pax-t1)", margin:0, fontSize:"0.9375rem" }}>{label}</p>
        <p style={{ fontSize:"0.8125rem", color:"var(--pax-t4)", margin:"2px 0 0" }}>{sub}</p>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"0" }}>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          style={{ width:"2.25rem", height:"2.25rem", borderRadius:"9999px", border:"1.5px solid var(--pax-brd)", background:"var(--pax-card)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--pax-t2)", transition:"border-color 0.15s, background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor=P}
          onMouseLeave={e => e.currentTarget.style.borderColor="var(--pax-brd)"}>
          <IMinus size={16} color="currentColor" sw={2}/>
        </button>
        <span style={{ width:"3rem", textAlign:"center", fontWeight:700, color:"var(--pax-t1)", fontSize:"1.125rem" }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          style={{ width:"2.25rem", height:"2.25rem", borderRadius:"9999px", border:"none", background:P, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background=PH}
          onMouseLeave={e => e.currentTarget.style.background=P}>
          <IPlus size={16} color="var(--pax-card)" sw={2}/>
        </button>
      </div>
    </div>
  );

  const ctxFields = [
    { label:"Event Type", value:ctx.eventType, icon:<ITag size={14} color={P} sw={1.75}/> },
    { label:"Date",       value:fmtDate(ctx.date), icon:<ICalendar size={14} color={P} sw={1.75}/> },
    { label:"Shift",      value:ctx.shift, icon:<IFile size={14} color={P} sw={1.75}/> },
    { label:"Venue",      value:ctx.venueName, icon:<IPin size={14} color={P} sw={1.75}/> },
  ].filter(f => f.value);

  return (
    <div className="pax-card">
      <SectionCard icon={<ICalendar size={18} color="#fff" sw={1.75}/>} title="Event Details" description="Confirm your event context and guest count.">
        {ctxFields.length > 0 && (
          <div style={{ background:"var(--pax-muted)", border:"1px solid var(--pax-brd3)", borderRadius:"14px", padding:"1.125rem 1.25rem", marginBottom:"1.5rem" }}>
            <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--pax-t4)", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 0.875rem" }}>Event Context</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"0.875rem" }}>
              {ctxFields.map(f => (
                <div key={f.label}>
                  <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"3px" }}>
                    {f.icon}
                    <span style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--pax-t4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>{f.label}</span>
                  </div>
                  <p style={{ fontSize:"0.9375rem", fontWeight:600, color:"var(--pax-t1)", margin:0 }}>{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: belowMin ? "1rem" : 0 }}>
          <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--pax-t4)", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 0.25rem" }}>Guest Count</p>
          <CounterRow label="Adults" sub="Age 13 and above" value={adultCount} onChange={setAdultCount}/>
          <div style={{ padding:"1.125rem 0 0" }}>
            <CounterRow label="Children" sub="Age 2–12 years" value={childCount} onChange={setChildCount}/>
          </div>
          {total > 0 && (
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"0.75rem" }}>
              <span style={{ fontSize:"0.875rem", color:"var(--pax-t3)" }}>Total: <strong style={{ color:"var(--pax-t1)" }}>{total} guests</strong></span>
            </div>
          )}
        </div>

        {belowMin && (
          <div style={{ marginTop:"1rem" }}>
            <InfoBanner color="amber" icon={<IWarn size={16} color="#92400E" sw={2}/>}>
              Minimum capacity is <strong>{MINIMUM_PAX} guests</strong>. A minimum charge applies for the shortfall of {MINIMUM_PAX - total} guests.
            </InfoBanner>
          </div>
        )}
      </SectionCard>

      <InfoBanner color="blue">
        This is an enquiry only. You'll receive a detailed quote within 24 hours of submitting.
      </InfoBanner>
    </div>
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
    <div className="pax-card">
      <SectionCard icon={<IUtensils size={18} color="#fff" sw={1.75}/>} title="Food Menu Selection" description="Choose a preset package or build a custom menu.">
        {/* Tab switcher */}
        <div style={{ display:"inline-flex", background:"var(--pax-muted2)", borderRadius:"12px", padding:"4px", marginBottom:"1.5rem" }}>
          {[{ id:"packages", label:"Preset Packages" }, { id:"custom", label:"Custom Menu" }].map(tab => (
            <button key={tab.id} type="button" onClick={() => onSwitchTab(tab.id)}
              style={{ padding:"8px 20px", borderRadius:"9px", border:"none", fontWeight:600, fontSize:"0.9375rem", cursor:"pointer", transition:"all 0.2s", background: menuTab === tab.id ? "var(--pax-card)" : "transparent", color: menuTab === tab.id ? "var(--pax-t1)" : "var(--pax-t3)", boxShadow: menuTab === tab.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Packages tab */}
        {menuTab === "packages" && (
          loadingPackages ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"1rem" }}>
              {[1,2,3].map(n => (
                <div key={n} style={{ borderRadius:"16px", overflow:"hidden", height:"180px", background:"linear-gradient(90deg, var(--pax-muted2) 25%, var(--pax-brd) 50%, var(--pax-muted2) 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>
              ))}
            </div>
          ) : packagesList.length === 0 ? (
            <div style={{ textAlign:"center", padding:"3rem", border:"2px dashed var(--pax-brd)", borderRadius:"16px" }}>
              <IUtensils size={32} color="#D1D5DB" sw={1.25}/>
              <p style={{ fontWeight:600, color:"var(--pax-t2)", margin:"1rem 0 0.25rem" }}>No packages available</p>
              <p style={{ color:"var(--pax-t4)", fontSize:"0.875rem", margin:0 }}>Please contact the venue directly.</p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"1rem" }}>
              {packagesList.map(pkg => {
                const isSel = selectedPackage?.id === pkg.id;
                const perPax = pkg.package_amount || 0;
                const total = perPax * adultCount;
                return (
                  <div key={pkg.id} className="pkg-card" onClick={() => openPackageModal(pkg)}
                    style={{ background:"var(--pax-card)", border:`2px solid ${isSel ? P : "var(--pax-brd)"}`, borderRadius:"16px", padding:"1.25rem", cursor:"pointer", position:"relative", boxShadow: isSel ? `0 0 0 3px ${PR}` : "0 1px 3px rgba(0,0,0,0.04)" }}>
                    {/* Selected badge */}
                    {isSel && (
                      <span style={{ position:"absolute", top:"12px", right:"12px", background:P, color:"var(--pax-card)", borderRadius:"9999px", padding:"3px 10px", fontSize:"0.6875rem", fontWeight:700, display:"flex", alignItems:"center", gap:"4px" }}>
                        <ICheck size={10} color="var(--pax-card)" sw={2.5}/> Selected
                      </span>
                    )}
                    {/* Popular badge */}
                    {pkg.is_popular && !isSel && (
                      <span style={{ position:"absolute", top:"12px", right:"12px", background:"#FFFBEB", color:"#92400E", border:"1px solid #FDE68A", borderRadius:"9999px", padding:"3px 10px", fontSize:"0.6875rem", fontWeight:700, display:"flex", alignItems:"center", gap:"4px" }}>
                        <IStar size={10} color="#D97706" sw={2}/> Popular
                      </span>
                    )}
                    <h4 style={{ fontWeight:700, color:"var(--pax-t1)", margin:"0 0 4px", fontSize:"1rem", paddingRight: (isSel || pkg.is_popular) ? "4rem" : 0 }}>{pkg.package_name}</h4>
                    <p style={{ margin:"0 0 0.875rem" }}>
                      <span style={{ fontWeight:800, color:P, fontSize:"1.125rem" }}>{fmt(perPax)}</span>
                      <span style={{ fontSize:"0.8125rem", color:"var(--pax-t4)", fontWeight:400 }}> / person</span>
                    </p>
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"0.875rem" }}>
                      {pkg.package_food_type === 1 && (
                        <span style={{ fontSize:"0.6875rem", fontWeight:700, padding:"3px 8px", background:"#F0FDF4", color:"#15803D", borderRadius:"9999px", display:"flex", alignItems:"center", gap:"4px" }}>
                          <ILeaf size={10} color="#15803D" sw={2}/> Veg
                        </span>
                      )}
                      {pkg.package_food_type === 2 && (
                        <span style={{ fontSize:"0.6875rem", fontWeight:700, padding:"3px 8px", background:"#FFF1F2", color:"#BE123C", borderRadius:"9999px" }}>Non-Veg</span>
                      )}
                      {pkg.categories?.length > 0 && (
                        <span style={{ fontSize:"0.6875rem", fontWeight:600, padding:"3px 8px", background:"var(--pax-pll)", color:P, borderRadius:"9999px" }}>{pkg.categories.length} courses</span>
                      )}
                    </div>
                    {pkg.categories?.length > 0 && (
                      <p style={{ fontSize:"0.8125rem", color:"var(--pax-t4)", margin:"0 0 0.875rem", lineHeight:1.4 }}>
                        {pkg.categories.slice(0,4).map(c=>c.name||c).join(" · ")}{pkg.categories.length > 4 ? " +more" : ""}
                      </p>
                    )}
                    {adultCount > 0 && (
                      <div style={{ borderTop:"1px solid var(--pax-brd3)", paddingTop:"0.75rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontSize:"0.8125rem", color:"var(--pax-t4)" }}>{adultCount} × {fmt(perPax)}</span>
                        <span style={{ fontWeight:700, color:"var(--pax-t1)", fontSize:"1rem" }}>{fmt(total)}</span>
                      </div>
                    )}
                    <p style={{ fontSize:"0.8125rem", color:P, fontWeight:600, margin:"0.625rem 0 0", display:"flex", alignItems:"center", gap:"4px" }}>
                      Customise menu <IArrowR size={13} color={P} sw={2}/>
                    </p>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Custom tab */}
        {menuTab === "custom" && (
          customMenuItems.length === 0 ? (
            <div onClick={openCustomMenuModal} style={{ textAlign:"center", padding:"3rem 2rem", border:"2px dashed var(--pax-brd)", borderRadius:"16px", cursor:"pointer", transition:"border-color 0.2s, background 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=P; e.currentTarget.style.background=PLL; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="var(--pax-brd)"; e.currentTarget.style.background="transparent"; }}>
              <div style={{ width:"3.5rem", height:"3.5rem", borderRadius:"50%", background:PLL, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem" }}>
                <IUtensils size={22} color={P} sw={1.75}/>
              </div>
              <p style={{ fontWeight:700, color:"var(--pax-t1)", margin:"0 0 0.375rem", fontSize:"1rem" }}>Build Your Custom Menu</p>
              <p style={{ color:"var(--pax-t4)", fontSize:"0.875rem", margin:"0 0 1.25rem", lineHeight:1.5 }}>Pick items from our full catalogue across all categories</p>
              <BtnPrimary type="button" onClick={e => { e.stopPropagation(); openCustomMenuModal(); }}>Browse Menu Items</BtnPrimary>
            </div>
          ) : (
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                <div>
                  <p style={{ fontWeight:700, color:"var(--pax-t1)", margin:0, fontSize:"0.9375rem" }}>{customMenuItems.length} items selected</p>
                  <p style={{ fontSize:"0.8125rem", color:"var(--pax-t4)", margin:"2px 0 0" }}>{Object.keys(groupedCustom).length} categories</p>
                </div>
                <BtnSecondary type="button" onClick={openCustomMenuModal} style={{ height:"38px", fontSize:"0.875rem" }}>Edit Selection</BtnSecondary>
              </div>
              <div style={{ ...card, padding:0, overflow:"hidden" }}>
                {Object.entries(groupedCustom).map(([cat, items], gi) => (
                  <div key={cat} style={{ borderBottom: gi < Object.keys(groupedCustom).length - 1 ? "1px solid var(--pax-brd3)" : "none", padding:"0.875rem 1.125rem" }}>
                    <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--pax-t4)", textTransform:"uppercase", letterSpacing:"0.05em", margin:"0 0 0.625rem" }}>{cat}</p>
                    {items.map(item => (
                      <div key={item.id} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0.3rem 0" }}>
                        <span style={{ width:"8px", height:"8px", borderRadius:"50%", background: item.food_type===1 ? "#16A34A" : "#DC2626", flexShrink:0 }}/>
                        <span style={{ flex:1, fontSize:"0.9375rem", color:"var(--pax-t2)" }}>{item.item_name}</span>
                        <button type="button" onClick={() => removeCustomItem(item.id)} style={{ background:"none", border:"none", color:"var(--pax-t4)", cursor:"pointer", padding:"4px", display:"flex", borderRadius:"6px", transition:"color 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.color="#EF4444"}
                          onMouseLeave={e => e.currentTarget.style.color="var(--pax-t4)"}>
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
      </SectionCard>
    </div>
  );
}

// ─── Step 3 — Requirements ────────────────────────────────────────────────────
function StepRequirements({ dietary, setDietary, allergies, setAllergies, otherAllergy, setOtherAllergy, servingPref, setServingPref, notes, setNotes }) {
  const CheckPill = ({ checked, onChange, label }) => (
    <label style={{ display:"flex", alignItems:"center", gap:"8px", padding:"10px 14px", border:`1.5px solid ${checked ? P : "var(--pax-brd)"}`, borderRadius:"10px", cursor:"pointer", background: checked ? PLL : "var(--pax-card)", transition:"all 0.15s", userSelect:"none" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width:"15px", height:"15px", accentColor:P, flexShrink:0 }}/>
      <span style={{ fontSize:"0.875rem", fontWeight: checked ? 600 : 400, color: checked ? P : "var(--pax-t2)" }}>{label}</span>
    </label>
  );

  const RadioPill = ({ checked, onChange, label }) => (
    <label style={{ display:"flex", alignItems:"center", gap:"8px", padding:"10px 14px", border:`1.5px solid ${checked ? P : "var(--pax-brd)"}`, borderRadius:"10px", cursor:"pointer", background: checked ? PLL : "var(--pax-card)", transition:"all 0.15s", userSelect:"none" }}>
      <input type="radio" name="servingPref" checked={checked} onChange={onChange} style={{ width:"15px", height:"15px", accentColor:P, flexShrink:0 }}/>
      <span style={{ fontSize:"0.875rem", fontWeight: checked ? 600 : 400, color: checked ? P : "var(--pax-t2)" }}>{label}</span>
    </label>
  );

  return (
    <div className="pax-card" style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SectionCard icon={<IFile size={18} color="#fff" sw={1.75}/>} title="Dietary Restrictions" description="Select all that apply for your guest group.">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:"0.625rem" }}>
          {DIETARY_OPTIONS.map(opt => (
            <CheckPill key={opt.id} checked={!!dietary[opt.id]} onChange={e => setDietary(p => ({ ...p, [opt.id]: e.target.checked }))} label={opt.label}/>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={<IWarn size={18} color="#fff" sw={1.75}/>} title="Food Allergies" description="Important for our kitchen team to note.">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:"0.625rem" }}>
          {ALLERGY_OPTIONS.map(opt => (
            <CheckPill key={opt.id} checked={!!allergies[opt.id]} onChange={e => setAllergies(p => ({ ...p, [opt.id]: e.target.checked }))} label={opt.label}/>
          ))}
        </div>
        {allergies.other && (
          <div style={{ marginTop:"1rem" }}>
            <PaxInput label="Specify other allergies" value={otherAllergy} onChange={e => setOtherAllergy(e.target.value)} placeholder="Please describe the allergy" type="text"/>
          </div>
        )}
      </SectionCard>

      <SectionCard icon={<IUtensils size={18} color="#fff" sw={1.75}/>} title="Serving Style" description="How would you like the food served?">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:"0.625rem" }}>
          {SERVING_PREFS.map(pref => (
            <RadioPill key={pref} checked={servingPref===pref} onChange={() => setServingPref(pref)} label={pref}/>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={<IFile size={18} color="#fff" sw={1.75}/>} title="Additional Notes" last>
        <FieldWrap hint="Decor theme, live music, seating preferences, or any other special requests">
          <textarea
            rows={4} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="E.g. Garden-themed decor, live ghazal music setup, bride's side left-facing..."
            className="pax-input"
            style={{ ...inputBase, height:"auto", padding:"14px", resize:"vertical", lineHeight:1.6 }}
          />
        </FieldWrap>
      </SectionCard>
    </div>
  );
}

// ─── Step 4 — Contact ─────────────────────────────────────────────────────────
function StepContact({ name, setName, email, setEmail, phone, setPhone, org, setOrg, errors }) {
  return (
    <div className="pax-card">
      <SectionCard icon={<IUsers size={18} color="#fff" sw={1.75}/>} title="Contact Information" description="We'll send your quote and updates to these details.">
        <div style={{ display:"flex", flexDirection:"column", gap:"1.125rem" }}>
          <PaxInput label="Full Name" required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" error={errors.name} icon={<IUsers size={16} color="var(--pax-t4)" sw={1.75}/>}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <PaxInput label="Email Address" required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" error={errors.email} icon={<IMail size={16} color="var(--pax-t4)" sw={1.75}/>}/>
            <PaxInput label="Phone Number" required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" error={errors.phone} icon={<IPhone size={16} color="var(--pax-t4)" sw={1.75}/>}/>
          </div>
          <FieldWrap label="Organization" hint="Company or organization name (optional)">
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"var(--pax-t4)", display:"flex", pointerEvents:"none" }}><IBuild size={16} sw={1.75}/></span>
              <input type="text" value={org} onChange={e => setOrg(e.target.value)} placeholder="Company name" className="pax-input" style={{ ...inputBase, paddingLeft:"42px" }}/>
            </div>
          </FieldWrap>
        </div>
      </SectionCard>
    </div>
  );
}


// ─── Step 5 — Review ──────────────────────────────────────────────────────────
function StepReview({ ctx, adultCount, childCount, menuTab, selectedPackage, customMenuItems, dietary, allergies, otherAllergy, servingPref, notes, name, email, phone, org, pricing }) {
  const actD = Object.entries(dietary).filter(([,v])=>v).map(([k])=>DIETARY_OPTIONS.find(o=>o.id===k)?.label).filter(Boolean);
  const actA = Object.entries(allergies).filter(([,v])=>v).map(([k])=>k==="other"?(otherAllergy||"Other"):ALLERGY_OPTIONS.find(o=>o.id===k)?.label).filter(Boolean);
  const grp = useMemo(()=>{const m={};customMenuItems.forEach(i=>{const c=i.category_name||"Other";if(!m[c])m[c]=[];m[c].push(i);});return m;},[customMenuItems]);

  const ReviewSection = ({ title, icon, children }) => (
    <div style={{ marginBottom:"0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0.875rem 1.25rem", background:"var(--pax-muted)", borderBottom:"1px solid var(--pax-brd3)", borderTop:"1px solid var(--pax-brd3)" }}>
        <span style={{ color:P }}>{icon}</span>
        <p style={{ fontWeight:700, color:"var(--pax-t2)", margin:0, fontSize:"0.875rem", textTransform:"uppercase", letterSpacing:"0.04em" }}>{title}</p>
      </div>
      <div style={{ padding:"1rem 1.25rem" }}>{children}</div>
    </div>
  );

  const ReviewRow = ({ label, value }) => value ? (
    <div style={{ display:"flex", gap:"1rem", marginBottom:"0.5rem", alignItems:"flex-start" }}>
      <span style={{ minWidth:"130px", fontSize:"0.875rem", color:"var(--pax-t4)", flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:"0.9375rem", color:"var(--pax-t1)", fontWeight:500, lineHeight:1.4 }}>{String(value)}</span>
    </div>
  ) : null;

  return (
    <div className="pax-card" style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <div>
        <h2 style={{ fontWeight:800, color:"var(--pax-t1)", fontSize:"1.375rem", margin:"0 0 0.25rem" }}>Review &amp; Submit</h2>
        <p style={{ color:"var(--pax-t3)", fontSize:"0.9375rem", margin:0 }}>Everything looks good? Submit your enquiry below.</p>
      </div>

      <div style={{ ...card, overflow:"hidden", padding:0 }}>
        <ReviewSection title="Event Details" icon={<ICalendar size={14} sw={2}/>}>
          <ReviewRow label="Event Type" value={ctx.eventType}/>
          <ReviewRow label="Date" value={fmtDate(ctx.date)}/>
          <ReviewRow label="Shift" value={ctx.shift}/>
          <ReviewRow label="Venue" value={ctx.venueName}/>
        </ReviewSection>
        <ReviewSection title="Guest Count" icon={<IUsers size={14} sw={2}/>}>
          <ReviewRow label="Adults" value={adultCount}/>
          {childCount > 0 && <ReviewRow label="Children" value={childCount}/>}
          <ReviewRow label="Total Guests" value={adultCount + childCount}/>
        </ReviewSection>
        <ReviewSection title="Menu Selection" icon={<IUtensils size={14} sw={2}/>}>
          {menuTab==="packages" && selectedPackage ? (
            <><ReviewRow label="Package" value={selectedPackage.package_name}/><ReviewRow label="Rate" value={`${fmt(selectedPackage.package_amount)} / person`}/></>
          ) : menuTab==="custom" && customMenuItems.length > 0 ? (
            <><ReviewRow label="Type" value="Custom Menu"/>{Object.entries(grp).map(([c,its])=><ReviewRow key={c} label={c} value={its.map(i=>i.item_name).join(", ")}/>)}</>
          ) : (
            <ReviewRow label="Menu" value="Not yet selected"/>
          )}
        </ReviewSection>
        {(actD.length>0||actA.length>0||servingPref||notes) && (
          <ReviewSection title="Special Requirements" icon={<IFile size={14} sw={2}/>}>
            {actD.length>0&&<ReviewRow label="Dietary" value={actD.join(", ")}/>}
            {actA.length>0&&<ReviewRow label="Allergies" value={actA.join(", ")}/>}
            {servingPref&&<ReviewRow label="Serving Style" value={servingPref}/>}
            {notes&&<ReviewRow label="Notes" value={notes}/>}
          </ReviewSection>
        )}
        <ReviewSection title="Contact Details" icon={<IUsers size={14} sw={2}/>}>
          <ReviewRow label="Name" value={name}/>
          <ReviewRow label="Email" value={email}/>
          <ReviewRow label="Phone" value={phone}/>
          {org&&<ReviewRow label="Organization" value={org}/>}
        </ReviewSection>
      </div>

      {pricing.total > 0 && (
        <div style={{ background:`linear-gradient(135deg, ${PLL}, ${PL})`, border:`1.5px solid ${PL}`, borderRadius:"16px", padding:"1.25rem 1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:"0.8125rem", fontWeight:600, color:P, margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.05em" }}>Estimated Total</p>
            <p style={{ fontSize:"0.8125rem", color:"var(--pax-t3)", margin:0 }}>Incl. applicable taxes</p>
          </div>
          <span style={{ fontWeight:800, color:P, fontSize:"1.75rem" }}>{fmt(pricing.total)}</span>
        </div>
      )}

      <InfoBanner color="blue">
        By submitting, you agree to receive a quote via email within 24 hours. No payment is required at this stage.
      </InfoBanner>
    </div>
  );
}

// ─── PackageModal ─────────────────────────────────────────────────────────────
function PackageModal({ pkg, menuCategories, menuItems, selections, setSelections, onCancel, onConfirm }) {
  const [expanded, setExpanded] = useState({});
  const categories = useMemo(() => {
    if (!pkg || !menuCategories) return [];
    const ids = new Set((pkg.categories || []).map(c => c.id ?? c));
    return ids.size > 0 ? menuCategories.filter(c => ids.has(c.id)) : menuCategories;
  }, [pkg, menuCategories]);

  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const toggleItem = (catId, item) => setSelections(p => {
    const cur = p[catId] || [];
    return { ...p, [catId]: cur.some(i => i.id === item.id) ? cur.filter(i => i.id !== item.id) : [...cur, item] };
  });
  const done = categories.filter(c => (selections[c.id] || []).length > 0).length;
  const allOk = categories.length > 0 && done === categories.length;
  const forCat = cid => (menuItems || []).filter(i => i.category_id === cid);
  const preview = useMemo(() => {
    const m = {};
    categories.forEach(c => { const s = selections[c.id] || []; if (s.length) m[c.name] = s; });
    return m;
  }, [categories, selections]);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,15,15,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000, padding:"1rem", backdropFilter:"blur(4px)" }}>
      {/* Modal shell — flex column so action bar is always at the bottom */}
      <div className="pax-modal" style={{ background:"var(--pax-card)", borderRadius:"24px", maxWidth:"1200px", width:"95%", maxHeight:"88vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}>

        {/* ── Top: two-column panel area that fills remaining height ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", flex:1, minHeight:0, overflow:"hidden" }}>

          {/* Left panel */}
          <div style={{ display:"flex", flexDirection:"column", overflow:"hidden", borderRight:"1.5px solid var(--pax-brd3)" }}>
            {/* Header */}
            <div style={{ padding:"1.5rem 1.75rem", borderBottom:"1.5px solid var(--pax-brd3)", flexShrink:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <p style={{ fontSize:"0.75rem", fontWeight:700, color:P, textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 4px" }}>Customise Package</p>
                  <h2 style={{ fontWeight:800, color:"var(--pax-t1)", margin:0, fontSize:"1.25rem" }}>{pkg?.package_name}</h2>
                  <p style={{ color:"var(--pax-t4)", margin:"4px 0 0", fontSize:"0.875rem" }}>Select at least one item from each category</p>
                </div>
                <button type="button" onClick={onCancel} style={{ width:"2rem", height:"2rem", borderRadius:"8px", border:"1.5px solid var(--pax-brd)", background:"var(--pax-card)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--pax-t3)", flexShrink:0 }}>
                  <IClose size={16} sw={2}/>
                </button>
              </div>
              {/* Progress bar */}
              <div style={{ marginTop:"1rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                  <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--pax-t2)" }}>Progress</span>
                  <span style={{ fontSize:"0.8125rem", fontWeight:700, color: allOk ? "#059669" : P }}>{done}/{categories.length} categories</span>
                </div>
                <div style={{ height:"6px", background:"var(--pax-muted2)", borderRadius:"9999px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${categories.length ? (done/categories.length)*100 : 0}%`, background: allOk ? "#059669" : P, borderRadius:"9999px", transition:"width 0.3s" }}/>
                </div>
              </div>
            </div>

            {/* Categories — scrolls independently */}
            <div style={{ flex:1, overflowY:"auto", padding:"1.25rem 1.75rem" }}>
              {categories.map((cat, ci) => {
                const catItems = forCat(cat.id), catSel = selections[cat.id] || [], isOpen = !!expanded[cat.id], isFull = catSel.length > 0;
                return (
                  <div key={cat.id} style={{ marginBottom:"1rem", border:`1.5px solid ${isFull ? "#BBF7D0" : "var(--pax-muted2)"}`, borderRadius:"14px", overflow:"hidden", transition:"border-color 0.2s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"1rem 1.125rem", cursor:"pointer", background: isFull ? "#F0FDF4" : "var(--pax-muted)" }} onClick={() => toggle(cat.id)}>
                      <div style={{ width:"2rem", height:"2rem", borderRadius:"50%", background: isFull ? "#059669" : P, color:"var(--pax-card)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"0.8125rem", flexShrink:0 }}>
                        {isFull ? <ICheck size={13} color="var(--pax-card)" sw={2.5}/> : ci + 1}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:700, color:"var(--pax-t1)", margin:0, fontSize:"0.9375rem" }}>{cat.name}</p>
                        {isFull && <p style={{ fontSize:"0.8125rem", color:"#059669", margin:"1px 0 0", fontWeight:600 }}>{catSel.length} item{catSel.length!==1?"s":""} selected</p>}
                        {!isFull && <p style={{ fontSize:"0.8125rem", color:"var(--pax-t4)", margin:"1px 0 0" }}>Click to select items</p>}
                      </div>
                      <IChevD rot={isOpen} size={18} color="var(--pax-t3)" sw={2}/>
                    </div>
                    {/* Selected chips preview */}
                    {catSel.length > 0 && !isOpen && (
                      <div style={{ padding:"0.625rem 1.125rem 0.875rem", display:"flex", flexWrap:"wrap", gap:"6px" }}>
                        {catSel.map(item => (
                          <span key={item.id} style={{ fontSize:"0.75rem", padding:"3px 10px", background:PLL, color:P, border:`1px solid ${PL}`, borderRadius:"9999px", fontWeight:600 }}>{item.item_name}</span>
                        ))}
                      </div>
                    )}
                    {/* Items grid */}
                    {isOpen && (
                      <div style={{ padding:"1rem 1.125rem", background:"var(--pax-card)", borderTop:"1px solid var(--pax-brd3)" }}>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"0.5rem" }}>
                          {catItems.map(item => {
                            const isSel = catSel.some(i => i.id === item.id);
                            return (
                              <div key={item.id} onClick={() => toggleItem(cat.id, item)}
                                style={{ display:"flex", alignItems:"center", gap:"8px", padding:"9px 12px", border:`1.5px solid ${isSel ? P : "var(--pax-brd)"}`, borderRadius:"10px", cursor:"pointer", background: isSel ? PLL : "var(--pax-card)", transition:"all 0.15s" }}>
                                <input type="checkbox" checked={isSel} readOnly style={{ width:"15px", height:"15px", accentColor:P, flexShrink:0, pointerEvents:"none" }}/>
                                <span style={{ flex:1, fontSize:"0.875rem", color: isSel ? P : "var(--pax-t2)", fontWeight: isSel ? 600 : 400 }}>{item.item_name}</span>
                                <span style={{ width:"8px", height:"8px", borderRadius:"50%", background: item.food_type===1 ? "#16A34A" : "#DC2626", flexShrink:0 }}/>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right preview — scrolls independently */}
          <div style={{ display:"flex", flexDirection:"column", background:"var(--pax-muted)", overflow:"hidden" }}>
            <div style={{ padding:"1.5rem 1.75rem", borderBottom:"1.5px solid var(--pax-brd3)", background:"var(--pax-card)", flexShrink:0 }}>
              <p style={{ fontWeight:800, color:"var(--pax-t1)", margin:0, fontSize:"1rem" }}>Menu Preview</p>
              <p style={{ color:"var(--pax-t4)", fontSize:"0.8125rem", margin:"4px 0 0" }}>{Object.values(preview).flat().length} items selected</p>
            </div>
            {Object.keys(preview).length === 0 ? (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", color:"var(--pax-t4)", textAlign:"center" }}>
                <div style={{ width:"3rem", height:"3rem", borderRadius:"50%", background:"var(--pax-muted2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"0.75rem" }}>
                  <IUtensils size={20} color="#D1D5DB" sw={1.5}/>
                </div>
                <p style={{ fontWeight:600, margin:"0 0 0.25rem", color:"var(--pax-t3)" }}>Nothing here yet</p>
                <p style={{ fontSize:"0.8125rem", margin:0 }}>Your menu will appear as you select items</p>
              </div>
            ) : (
              <div style={{ flex:1, overflowY:"auto", padding:"1.25rem 1.5rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
                {Object.entries(preview).map(([catName, items]) => (
                  <div key={catName} style={{ background:"var(--pax-card)", borderRadius:"12px", padding:"1rem 1.125rem", border:"1.5px solid var(--pax-brd3)" }}>
                    <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--pax-t4)", textTransform:"uppercase", letterSpacing:"0.05em", margin:"0 0 0.75rem" }}>{catName}</p>
                    {items.map(item => (
                      <div key={item.id} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"5px 0" }}>
                        <span style={{ width:"8px", height:"8px", borderRadius:"50%", background: item.food_type===1 ? "#16A34A" : "#DC2626", flexShrink:0 }}/>
                        <span style={{ fontSize:"0.875rem", color:"var(--pax-t2)" }}>{item.item_name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Fixed action bar — always visible, spans full modal width ── */}
        <div style={{ padding:"1rem 1.75rem", borderTop:"1.5px solid var(--pax-brd3)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.75rem", flexShrink:0, background:"var(--pax-card)" }}>
          {/* Left: completion status hint */}
          <p style={{ margin:0, fontSize:"0.8125rem", color: allOk ? "#059669" : "var(--pax-t4)", fontWeight: allOk ? 600 : 400 }}>
            {allOk ? "✓ All categories selected" : `${categories.length - done} categor${categories.length - done === 1 ? "y" : "ies"} remaining`}
          </p>
          {/* Right: actions */}
          <div style={{ display:"flex", gap:"0.75rem", flexShrink:0 }}>
            <BtnSecondary type="button" onClick={onCancel}>Cancel</BtnSecondary>
            <BtnPrimary type="button" onClick={onConfirm} disabled={!allOk}>
              {allOk ? <><ICheck size={15} color="var(--pax-card)" sw={2.5}/> Confirm Selection</> : "Complete all categories"}
            </BtnPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CustomMenuModal ──────────────────────────────────────────────────────────
function CustomMenuModal({ menuCategories, menuItems, selected, setSelected, onClose, onConfirm, isMobile }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeCat, setActiveCat] = useState(null);
  const [showSel, setShowSel] = useState(false);

  const visible = useMemo(() => {
    let items = activeCat ? (menuItems||[]).filter(i=>i.category_id===activeCat) : (menuItems||[]);
    if (filter==="veg") items=items.filter(i=>i.food_type===1);
    if (filter==="nonveg") items=items.filter(i=>i.food_type!==1);
    if (search) items=items.filter(i=>i.item_name?.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [menuItems, activeCat, filter, search]);

  const toggle = item => setSelected(p=>p.some(i=>i.id===item.id)?p.filter(i=>i.id!==item.id):[...p,item]);
  const grpSel = useMemo(()=>{const m={};selected.forEach(i=>{const c=i.category_name||"Other";if(!m[c])m[c]=[];m[c].push(i);});return m;},[selected]);

  const FiltersBar = () => (
    <div style={{ padding:"0.875rem 1.5rem", borderBottom:"1.5px solid var(--pax-brd3)", display:"flex", flexDirection:"column", gap:"0.75rem", flexShrink:0, background:"var(--pax-card)" }}>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"var(--pax-t4)", display:"flex", pointerEvents:"none" }}><ISearch size={16} sw={2}/></span>
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search menu items…" className="pax-input"
          style={{ ...inputBase, height:"42px", paddingLeft:"42px", fontSize:"0.875rem" }}/>
      </div>
      <div style={{ display:"flex", gap:"6px", overflowX:"auto", paddingBottom:"2px" }}>
        {[["all","All"],["veg","🟢 Veg"],["nonveg","🔴 Non-Veg"]].map(([v,l])=>(
          <button key={v} type="button" onClick={()=>setFilter(v)} style={{ padding:"6px 14px", borderRadius:"9999px", border:`1.5px solid ${filter===v?P:"var(--pax-brd)"}`, background:filter===v?PLL:"var(--pax-card)", color:filter===v?P:"var(--pax-t2)", fontWeight:filter===v?700:500, fontSize:"0.8125rem", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>{l}</button>
        ))}
        <div style={{ width:"1px", background:"var(--pax-brd)", margin:"0 2px", flexShrink:0 }}/>
        <button type="button" onClick={()=>setActiveCat(null)} style={{ padding:"6px 14px", borderRadius:"9999px", border:`1.5px solid ${activeCat===null?P:"var(--pax-brd)"}`, background:activeCat===null?PLL:"var(--pax-card)", color:activeCat===null?P:"var(--pax-t2)", fontWeight:activeCat===null?700:500, fontSize:"0.8125rem", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>All Courses</button>
        {(menuCategories||[]).map(cat=>(
          <button key={cat.id} type="button" onClick={()=>setActiveCat(cat.id)} style={{ padding:"6px 14px", borderRadius:"9999px", border:`1.5px solid ${activeCat===cat.id?P:"var(--pax-brd)"}`, background:activeCat===cat.id?PLL:"var(--pax-card)", color:activeCat===cat.id?P:"var(--pax-t2)", fontWeight:activeCat===cat.id?700:500, fontSize:"0.8125rem", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>{cat.name}</button>
        ))}
      </div>
    </div>
  );

  const ItemsGrid = () => (
    <div style={{ flex:1, overflowY:"auto", padding:"1.25rem 1.5rem" }}>
      {visible.length===0 ? (
        <div style={{ textAlign:"center", padding:"3rem", color:"var(--pax-t4)" }}>
          <ISearch size={28} color="#D1D5DB" sw={1.5}/>
          <p style={{ fontWeight:600, margin:"0.75rem 0 0.25rem", color:"var(--pax-t3)" }}>No items found</p>
          <p style={{ fontSize:"0.875rem", margin:0 }}>Try a different search or filter</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"0.625rem" }}>
          {visible.map(item=>{
            const isSel=selected.some(i=>i.id===item.id);
            return (
              <div key={item.id} onClick={()=>toggle(item)}
                style={{ display:"flex", alignItems:"center", gap:"10px", padding:"11px 14px", border:`1.5px solid ${isSel?P:"var(--pax-brd)"}`, borderRadius:"12px", cursor:"pointer", background:isSel?PLL:"var(--pax-card)", transition:"all 0.15s" }}
                onMouseEnter={e=>{if(!isSel){e.currentTarget.style.borderColor="#D1D5DB";e.currentTarget.style.background="var(--pax-muted)";}}}
                onMouseLeave={e=>{if(!isSel){e.currentTarget.style.borderColor="var(--pax-brd)";e.currentTarget.style.background="var(--pax-card)";}}}>
                <input type="checkbox" checked={isSel} readOnly style={{ width:"15px", height:"15px", accentColor:P, flexShrink:0, pointerEvents:"none" }}/>
                <span style={{ flex:1, fontSize:"0.9375rem", color:isSel?P:"var(--pax-t1)", fontWeight:isSel?600:400 }}>{item.item_name}</span>
                <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:item.food_type===1?"#16A34A":"#DC2626", flexShrink:0 }}/>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const SelectionPanel = () => (
    <div style={{ display:"flex", flexDirection:"column", background:"var(--pax-muted)", overflow:"hidden", borderLeft:"1.5px solid var(--pax-brd3)" }}>
      <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1.5px solid var(--pax-brd3)", background:"var(--pax-card)", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <p style={{ fontWeight:800, color:"var(--pax-t1)", margin:0, fontSize:"1rem" }}>Your Selection</p>
        <span style={{ fontSize:"0.8125rem", fontWeight:700, color:P, background:PLL, padding:"3px 10px", borderRadius:"9999px", border:`1px solid ${PL}` }}>{selected.length} items</span>
      </div>
      {selected.length===0 ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", color:"var(--pax-t4)", textAlign:"center" }}>
          <IUtensils size={24} color="#D1D5DB" sw={1.5}/>
          <p style={{ fontWeight:600, margin:"0.75rem 0 0.25rem", color:"var(--pax-t3)" }}>Nothing selected</p>
          <p style={{ fontSize:"0.8125rem", margin:0 }}>Click items on the left to add them</p>
        </div>
      ) : (
        <div style={{ flex:1, overflowY:"auto", padding:"1.125rem 1.5rem" }}>
          {Object.entries(grpSel).map(([cat,items])=>(
            <div key={cat} style={{ marginBottom:"1.25rem" }}>
              <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--pax-t4)", textTransform:"uppercase", letterSpacing:"0.05em", margin:"0 0 0.625rem" }}>{cat}</p>
              {items.map(item=>(
                <div key={item.id} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 10px", background:"var(--pax-card)", borderRadius:"10px", marginBottom:"6px", border:"1.5px solid var(--pax-brd3)" }}>
                  <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:item.food_type===1?"#16A34A":"#DC2626", flexShrink:0 }}/>
                  <span style={{ flex:1, fontSize:"0.875rem", color:"var(--pax-t2)", fontWeight:500 }}>{item.item_name}</span>
                  <button type="button" onClick={()=>toggle(item)} style={{ background:"none", border:"none", color:"var(--pax-t4)", cursor:"pointer", padding:"2px", display:"flex", borderRadius:"6px", transition:"color 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="#EF4444"}
                    onMouseLeave={e=>e.currentTarget.style.color="var(--pax-t4)"}>
                    <IClose size={13} sw={2}/>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div style={{ padding:"1.125rem 1.5rem", borderTop:"1.5px solid var(--pax-brd3)", background:"var(--pax-card)", flexShrink:0 }}>
        <InfoBanner color="blue"><span style={{ fontSize:"0.8125rem" }}>Custom menu pricing will be quoted separately by the venue.</span></InfoBanner>
        <div style={{ height:"0.75rem" }}/>
        <BtnPrimary type="button" onClick={onConfirm} style={{ width:"100%" }}>Confirm Selection ({selected.length})</BtnPrimary>
      </div>
    </div>
  );

  if (isMobile) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,15,15,0.6)", display:"flex", alignItems:"flex-end", zIndex:10000, backdropFilter:"blur(4px)" }}>
      <div className="pax-sheet" style={{ background:"var(--pax-card)", borderRadius:"24px 24px 0 0", width:"100%", maxHeight:"95vh", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1.5px solid var(--pax-brd3)", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div><p style={{ fontWeight:800, color:"var(--pax-t1)", margin:0, fontSize:"1.125rem" }}>Custom Menu</p><p style={{ color:"var(--pax-t4)", fontSize:"0.8125rem", margin:"2px 0 0" }}>{selected.length} items selected</p></div>
          <button type="button" onClick={onClose} style={{ width:"2rem", height:"2rem", borderRadius:"8px", border:"1.5px solid var(--pax-brd)", background:"var(--pax-card)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><IClose size={16} sw={2}/></button>
        </div>
        <FiltersBar/>
        <ItemsGrid/>
        <div style={{ borderTop:"2px solid var(--pax-brd3)", flexShrink:0 }}>
          <button type="button" onClick={()=>setShowSel(p=>!p)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.75rem", padding:"0.875rem 1.5rem", background:"var(--pax-muted)", border:"none", color:"var(--pax-t2)", fontWeight:600, cursor:"pointer", fontSize:"0.9375rem" }}>
            <span style={{ background:P, color:"var(--pax-card)", borderRadius:"9999px", padding:"2px 8px", fontSize:"0.8125rem", fontWeight:700 }}>{selected.length}</span>
            {showSel?"Hide":"View"} Selection <IChevD rot={showSel} size={16} sw={2}/>
          </button>
          {showSel && (
            <div style={{ maxHeight:"35vh", overflowY:"auto", padding:"0.875rem 1.5rem", borderTop:"1px solid var(--pax-brd3)" }}>
              {selected.length===0?<p style={{ color:"var(--pax-t4)", textAlign:"center", margin:0, padding:"1rem 0" }}>No items selected yet</p>:Object.entries(grpSel).map(([cat,items])=>(
                <div key={cat} style={{ marginBottom:"0.875rem" }}>
                  <p style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--pax-t4)", textTransform:"uppercase", letterSpacing:"0.05em", margin:"0 0 0.5rem" }}>{cat}</p>
                  {items.map(item=>(<div key={item.id} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"6px 0" }}><span style={{ width:"7px", height:"7px", borderRadius:"50%", background:item.food_type===1?"#16A34A":"#DC2626" }}/><span style={{ flex:1, fontSize:"0.875rem" }}>{item.item_name}</span><button type="button" onClick={()=>toggle(item)} style={{ background:"none", border:"none", color:"var(--pax-t4)", cursor:"pointer", display:"flex" }}><IClose size={13} sw={2}/></button></div>))}
                </div>
              ))}
            </div>
          )}
          <div style={{ padding:"0.875rem 1.5rem 1.25rem" }}>
            <BtnPrimary type="button" onClick={onConfirm} style={{ width:"100%" }}>Confirm Selection ({selected.length})</BtnPrimary>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,15,15,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000, padding:"1rem", backdropFilter:"blur(4px)" }}>
      <div className="pax-modal" style={{ background:"var(--pax-card)", borderRadius:"24px", maxWidth:"1400px", width:"95%", maxHeight:"90vh", display:"grid", gridTemplateColumns:"1fr 380px", overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ padding:"1.5rem 1.75rem", borderBottom:"1.5px solid var(--pax-brd3)", flexShrink:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div><p style={{ fontSize:"0.75rem", fontWeight:700, color:P, textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 4px" }}>Custom Menu</p><h2 style={{ fontWeight:800, color:"var(--pax-t1)", margin:0, fontSize:"1.25rem" }}>Build Your Menu</h2></div>
              <button type="button" onClick={onClose} style={{ width:"2rem", height:"2rem", borderRadius:"8px", border:"1.5px solid var(--pax-brd)", background:"var(--pax-card)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><IClose size={16} sw={2}/></button>
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
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,15,15,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10001, padding:"1rem", backdropFilter:"blur(4px)" }}>
      <div className="pax-modal" style={{ background:"var(--pax-card)", borderRadius:"20px", padding:"2rem", maxWidth:"420px", width:"100%", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ width:"3rem", height:"3rem", borderRadius:"50%", background:"#FFFBEB", border:"1.5px solid #FDE68A", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.25rem" }}>
          <IWarn size={22} color="#D97706" sw={2}/>
        </div>
        <h3 style={{ fontWeight:800, color:"var(--pax-t1)", margin:"0 0 0.625rem", fontSize:"1.25rem", textAlign:"center" }}>{title}</h3>
        <p style={{ color:"var(--pax-t3)", margin:"0 0 1.75rem", lineHeight:1.6, textAlign:"center", fontSize:"0.9375rem" }}>{message}</p>
        <div style={{ display:"flex", gap:"0.75rem" }}>
          <BtnSecondary type="button" onClick={onCancel} style={{ flex:1 }}>Cancel</BtnSecondary>
          <BtnPrimary type="button" onClick={onConfirm} style={{ flex:1 }}>Confirm</BtnPrimary>
        </div>
      </div>
    </div>
  );
}

// ─── SuccessModal ─────────────────────────────────────────────────────────────
function SuccessModal({ refNum, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,15,15,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10002, padding:"1rem", backdropFilter:"blur(4px)" }}>
      <div className="pax-modal" style={{ background:"var(--pax-card)", borderRadius:"24px", padding:"2.5rem 2rem", maxWidth:"30rem", width:"100%", boxShadow:"0 24px 64px rgba(0,0,0,0.2)", textAlign:"center" }}>
        <div style={{ width:"5rem", height:"5rem", borderRadius:"50%", background:"#ECFDF5", border:"2px solid #A7F3D0", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem" }}>
          <ICheckCirc size={40} color="#059669" sw={2}/>
        </div>
        <p style={{ fontSize:"0.75rem", fontWeight:700, color:"#059669", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 0.5rem" }}>Enquiry Submitted</p>
        <h2 style={{ fontSize:"1.625rem", fontWeight:800, color:"var(--pax-t1)", margin:"0 0 0.75rem" }}>You're all set!</h2>
        <p style={{ color:"var(--pax-t3)", margin:"0 0 1.75rem", lineHeight:1.6, fontSize:"0.9375rem" }}>Our venue team will review your enquiry and send a detailed quote within 24 hours.</p>
        {refNum && (
          <div style={{ background:"var(--pax-muted)", border:"1.5px solid var(--pax-brd3)", borderRadius:"14px", padding:"1rem 1.25rem", marginBottom:"1.5rem" }}>
            <p style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--pax-t4)", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 0.375rem" }}>Reference Number</p>
            <p style={{ fontSize:"1.375rem", fontWeight:800, color:P, fontFamily:"Courier New, monospace", letterSpacing:"0.05em", margin:0 }}>{refNum}</p>
          </div>
        )}
        <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:"12px", padding:"0.875rem 1rem", marginBottom:"1.5rem", display:"flex", gap:"8px", alignItems:"flex-start" }}>
          <ICheckCirc size={16} color="#059669" sw={2}/>
          <p style={{ color:"#065F46", fontSize:"0.875rem", margin:0, textAlign:"left", lineHeight:1.5 }}>A confirmation has been logged. Our team will reach out to {"“"}you within 24 hours with a detailed quote tailored to your requirements.</p>
        </div>
        <BtnPrimary type="button" onClick={onClose} style={{ width:"100%", justifyContent:"center" }}>Back to Home</BtnPrimary>
      </div>
    </div>
  );
}

// ─── MobileBottomBar ──────────────────────────────────────────────────────────
function MobileBottomBar({ pricing, showPanel, onToggle }) {
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"var(--pax-card)", borderTop:"1.5px solid var(--pax-brd2)", boxShadow:"0 -8px 24px rgba(124,58,237,0.08)", zIndex:40 }}>
      {showPanel && (
        <div className="pax-sheet" style={{ borderTop:"1.5px solid var(--pax-brd2)", maxHeight:"70vh", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1rem 1.25rem", borderBottom:"1px solid var(--pax-brd3)", position:"sticky", top:0, background:"var(--pax-card)" }}>
            <p style={{ fontWeight:700, color:"var(--pax-t1)", margin:0 }}>Price Breakdown</p>
            <button type="button" onClick={onToggle} style={{ background:"none", border:"none", color:"var(--pax-t3)", cursor:"pointer", display:"flex" }}><IClose size={18} sw={2}/></button>
          </div>
          <div style={{ padding:"1.25rem" }}><SummaryCard pricing={pricing} ctx={{}} selectedPackage={null} menuTab="" customMenuItems={[]} adultCount={0}/></div>
        </div>
      )}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.875rem 1.5rem" }}>
        <div>
          <p style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--pax-t4)", margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.04em" }}>Estimated Total</p>
          <p style={{ fontSize:"1.25rem", fontWeight:800, color:P, margin:0 }}>{pricing.total > 0 ? fmt(pricing.total) : "—"}</p>
        </div>
        <button type="button" onClick={onToggle} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", background:PLL, border:`1.5px solid ${PL}`, color:P, borderRadius:"9999px", fontWeight:600, cursor:"pointer", fontSize:"0.875rem", transition:"all 0.15s" }}>
          {showPanel ? "Hide" : "View Details"} <IChevD rot={showPanel} size={15} sw={2}/>
        </button>
      </div>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaxEnquiryPage() {
  const params      = useParams();
  const router      = useRouter();
  const searchParams = useSearchParams();

  const locale   = params?.locale  ?? "en";
  const country  = params?.country ?? "in";
  const venueId  = params?.id      ?? "";

  const ctx = useMemo(() => ({
    eventType:  searchParams.get("eventType")  ?? "",
    date:       searchParams.get("date")       ?? "",
    shift:      searchParams.get("shift")      ?? "",
    guests:     parseInt(searchParams.get("guests") ?? "0", 10),
    venueName:  searchParams.get("venueName")  ?? "",
    venueImage: searchParams.get("venueImage") ?? "",
  }), [searchParams]);

  // ── State ───────────────────────────────────────────────────────────────────
  const [step,          setStep]          = useState(1);
  const [menuTab,       setMenuTab]       = useState("packages");
  const [adultCount,    setAdultCount]    = useState(ctx.guests || 0);
  const [childCount,    setChildCount]    = useState(0);
  const [packagesList,    setPackagesList]    = useState([]);
  const [menuCategories,  setMenuCategories]  = useState([]);
  const [menuItems,       setMenuItems]       = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [venueImages,     setVenueImages]     = useState([]);
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
  const [showCustomModal, setShowCustomModal] = useState(false);
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

  useEffect(() => {
    try { const r = localStorage.getItem(DRAFT_KEY); if (r) { const d = JSON.parse(r); if (d.venueId === venueId) setHasDraft(true); } } catch {}
  }, [venueId]);

  useEffect(() => {
    try { const p = JSON.parse(localStorage.getItem("userProfile") || "{}"); if (p.name) setContactName(p.name); if (p.email) setContactEmail(p.email); if (p.phone) setContactPhone(p.phone); } catch {}
  }, []);

  useEffect(() => {
    setLoadingPackages(true);
    loadMockData().then(({ packages, categories, items }) => {
      setPackagesList(packages); setMenuCategories(categories); setMenuItems(items);
    }).finally(() => setLoadingPackages(false));
  }, [venueId]);

  // Load real venue gallery (same pattern as CheckoutClient)
  useEffect(() => {
    if (!venueId) return;
    let cancelled = false;
    loadVenues(venueId).then(res => {
      if (!cancelled && res?.data?.gallery?.length) setVenueImages(res.data.gallery);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [venueId]);

  // ── Pricing ─────────────────────────────────────────────────────────────────
  const pricing = useMemo(() => {
    let foodTotal = 0, foodDesc = "";
    if (menuTab === "packages" && selectedPackage) {
      foodTotal = (selectedPackage.package_amount || 0) * adultCount;
      foodDesc  = `${selectedPackage.package_name} × ${adultCount} persons`;
    } else if (menuTab === "custom" && customMenuItems.length > 0) {
      foodDesc = `Custom Menu (${customMenuItems.length} items)`;
    }
    const guestCount = adultCount + childCount;
    const addonSummary  = 0;
    const minimumCharge = guestCount > 0 && guestCount < MINIMUM_PAX && foodTotal > 0 ? (MINIMUM_PAX - guestCount) * (selectedPackage?.package_amount || 0) : 0;
    const subtotal = foodTotal + addonSummary + minimumCharge;
    const tax5 = foodTotal * FOOD_TAX, tax18 = addonSummary * ADDON_TAX, total = subtotal + tax5 + tax18;
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
    } catch {}
  };
  const dismissDraft = () => { localStorage.removeItem(DRAFT_KEY); setHasDraft(false); };

  // ── Navigation ───────────────────────────────────────────────────────────────
  const validateStep = s => {
    if (s === 4) {
      const e = {};
      if (!contactName.trim())  e.name  = "Full name is required";
      if (!contactEmail.trim()) e.email = "Email address is required";
      if (!contactPhone.trim()) e.phone = "Phone number is required";
      setErrors(e);
      return Object.keys(e).length === 0;
    }
    return true;
  };
  const goNext = () => { if (!validateStep(step)) return; setErrors({}); setStep(s => Math.min(5, s + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goBack = () => { setStep(s => Math.max(1, s - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // ── Tab Switch ────────────────────────────────────────────────────────────────
  const handleTabSwitch = tab => {
    if (tab === menuTab) return;
    const hasSel = menuTab === "packages" ? !!selectedPackage : customMenuItems.length > 0;
    if (hasSel) setConfirm({ title: "Switch Menu Mode?", message: "Switching will clear your current menu selection. This cannot be undone.", onConfirm: () => { setMenuTab(tab); setSelectedPackage(null); setPkgSelections({}); setCustomMenuItems([]); setConfirm(null); } });
    else setMenuTab(tab);
  };

  // ── Package Modal ─────────────────────────────────────────────────────────────
  const openPackageModal = pkg => {
    if (selectedPackage && selectedPackage.id !== pkg.id) {
      setConfirm({ title: "Switch Package?", message: `Switch to "${pkg.package_name}"? Your current customisations will be cleared.`, onConfirm: () => { setPendingPkg(pkg); setTempPkgSel({}); setShowPkgModal(true); setConfirm(null); } });
    } else { setPendingPkg(pkg); setTempPkgSel(selectedPackage?.id === pkg.id ? { ...pkgSelections } : {}); setShowPkgModal(true); }
  };
  const confirmPkg = () => { setSelectedPackage(pendingPkg); setPkgSelections(tempPkgSel); setShowPkgModal(false); setPendingPkg(null); };
  const cancelPkg  = () => setConfirm({ title: "Discard Selection?", message: "Leave without saving your item selections?", onConfirm: () => { setShowPkgModal(false); setPendingPkg(null); setConfirm(null); } });

  // ── Custom Menu ───────────────────────────────────────────────────────────────
  const openCustomMenuModal = () => { setTempCustomItems([...customMenuItems]); setShowCustomModal(true); };
  const confirmCustom       = () => { setCustomMenuItems([...tempCustomItems]); setShowCustomModal(false); };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const ref = genRef();
    try {
      await submitMockEnquiry({ venue_id: venueId, event_type: ctx.eventType, event_date: ctx.date, shift: ctx.shift, adult_count: adultCount, child_count: childCount, menu_mode: menuTab, package_id: selectedPackage?.id, custom_items: customMenuItems.map(i => i.id), dietary: Object.entries(dietary).filter(([,v])=>v).map(([k])=>k), allergies: Object.entries(allergies).filter(([,v])=>v).map(([k])=>k), other_allergy: otherAllergy, serving_pref: servingPref, notes, contact_name: contactName, contact_email: contactEmail, contact_phone: contactPhone, contact_org: contactOrg, _ref: ref });
      setEnquiryRef(ref); localStorage.removeItem(DRAFT_KEY); setShowSuccess(true);
    } catch (err) { console.error("PAX submit error:", err); }
    finally { setSubmitting(false); }
  };
  const handleSuccessClose = () => { setShowSuccess(false); router.push(`/${locale}/${country}`); };

  // ── Render ────────────────────────────────────────────────────────────────────
  const stepTitles = ["Event Details", "Food Menu", "Requirements", "Contact Info", "Review & Submit"];

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight:"100vh", background:"var(--pax-bg)", color:"var(--pax-t1)" }}>
        {/* ── Minimal Checkout-style Header ── */}
        <div style={{ position:"sticky", top:0, zIndex:40, background:"var(--pax-header)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)" }}>
          <div style={{ maxWidth:"1280px", margin:"0 auto", padding: isMobile ? "14px 1rem" : "16px 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.75rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", minWidth:0 }}>
              <button
                type="button"
                onClick={() => step > 1 ? goBack() : router.back()}
                style={{ width:"36px", height:"36px", borderRadius:"50%", border:"none", background:"var(--pax-muted2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background="var(--pax-brd)"}
                onMouseLeave={e => e.currentTarget.style.background="var(--pax-muted2)"}
                aria-label="Go back"
              >
                <IChevL size={16} sw={2.5} color="var(--pax-t2)"/>
              </button>
              <h1 style={{ fontWeight:700, color:"var(--pax-t1)", fontSize:"1.125rem", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{stepTitles[step-1]}</h1>
            </div>
            <p style={{ flexShrink:0, fontSize:"0.875rem", fontWeight:600, color:"var(--pax-t4)", whiteSpace:"nowrap", margin:0 }}>Step {step} of {STEPS.length}</p>
          </div>
          <div style={{ height:"3px", width:"100%", background:"var(--pax-brd3)" }}>
            <div style={{ height:"100%", borderRadius:"0 9999px 9999px 0", transition:"width 0.3s ease-out", background:"var(--pax-p)", width:`${(step/STEPS.length)*100}%` }}/>
          </div>
        </div>

        {/* ── Draft Banner ── */}
        {hasDraft && (
          <div style={{ background:PLL, borderBottom:`1px solid ${PL}` }}>
            <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"0.75rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", color:P, fontSize:"0.9375rem", fontWeight:500 }}>
                <IInfo size={16} color={P} sw={2}/> You have a saved draft for this venue.
              </div>
              <div style={{ display:"flex", gap:"0.5rem", flexShrink:0 }}>
                <BtnPrimary type="button" onClick={loadDraft} style={{ height:"34px", fontSize:"0.8125rem", padding:"0 14px" }}>Load Draft</BtnPrimary>
                <BtnSecondary type="button" onClick={dismissDraft} style={{ height:"34px", fontSize:"0.8125rem", padding:"0 14px" }}>Dismiss</BtnSecondary>
              </div>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        <div style={{ maxWidth:"1280px", margin:"0 auto", padding: isMobile ? "1.25rem 1rem 7rem" : "1.75rem 1.5rem 3rem" }}>
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 360px", gap:"1.5rem", alignItems:"start" }}>

            {/* Left: step content */}
            <div>
              {/* Step header (mobile) */}
              {isMobile && (
                <div style={{ marginBottom:"1rem" }}>
                  <h2 style={{ fontWeight:800, color:"var(--pax-t1)", fontSize:"1.25rem", margin:"0 0 4px" }}>{stepTitles[step-1]}</h2>
                </div>
              )}

              {/* Step panels */}
              {step === 1 && <StepEventDetails ctx={ctx} adultCount={adultCount} setAdultCount={setAdultCount} childCount={childCount} setChildCount={setChildCount}/>}
              {step === 2 && <StepFoodMenu menuTab={menuTab} packagesList={packagesList} loadingPackages={loadingPackages} selectedPackage={selectedPackage} adultCount={adultCount} openPackageModal={openPackageModal} customMenuItems={customMenuItems} openCustomMenuModal={openCustomMenuModal} removeCustomItem={id => setCustomMenuItems(p => p.filter(i => i.id !== id))} onSwitchTab={handleTabSwitch}/>}
              {step === 3 && <StepRequirements dietary={dietary} setDietary={setDietary} allergies={allergies} setAllergies={setAllergies} otherAllergy={otherAllergy} setOtherAllergy={setOtherAllergy} servingPref={servingPref} setServingPref={setServingPref} notes={notes} setNotes={setNotes}/>}
              {step === 4 && <StepContact name={contactName} setName={setContactName} email={contactEmail} setEmail={setContactEmail} phone={contactPhone} setPhone={setContactPhone} org={contactOrg} setOrg={setContactOrg} errors={errors}/>}
              {step === 5 && <StepReview ctx={ctx} adultCount={adultCount} childCount={childCount} menuTab={menuTab} selectedPackage={selectedPackage} customMenuItems={customMenuItems} dietary={dietary} allergies={allergies} otherAllergy={otherAllergy} servingPref={servingPref} notes={notes} name={contactName} email={contactEmail} phone={contactPhone} org={contactOrg} pricing={pricing}/>}

              {/* ── Nav bar ── */}
              <div style={{ marginTop:"1.5rem", borderTop:"1.5px solid var(--pax-brd3)", paddingTop:"1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.75rem" }}>
                {/* Back button */}
                <button type="button" onClick={goBack} disabled={step===1}
                  style={{ display:"flex", alignItems:"center", gap:"6px", padding:"0 1rem", height:"44px", borderRadius:"10px", border:"1.5px solid var(--pax-brd)", background:"var(--pax-card)", cursor: step===1 ? "not-allowed" : "pointer", color: step===1 ? "var(--pax-t4)" : "var(--pax-t2)", fontSize:"0.9375rem", fontWeight:600, transition:"all 0.15s", opacity: step===1 ? 0.45 : 1 }}>
                  <IChevL size={16} sw={2.5} color="currentColor"/> Back
                </button>

                {/* Right actions */}
                <div style={{ display:"flex", alignItems:"center", gap:"0.625rem" }}>
                  {step < 5 && (
                    <button type="button" onClick={saveDraft}
                      style={{ display:"flex", alignItems:"center", gap:"6px", padding:"0 1.125rem", height:"44px", borderRadius:"10px", border:"1.5px solid var(--pax-brd)", background:"var(--pax-card)", cursor:"pointer", color:"var(--pax-t2)", fontSize:"0.9375rem", fontWeight:600, transition:"all 0.15s" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      Save Draft
                    </button>
                  )}
                  {step < 5 ? (
                    <button type="button" onClick={goNext}
                      style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0 1.5rem", height:"44px", borderRadius:"10px", border:"none", background:P, cursor:"pointer", color:"#fff", fontSize:"0.9375rem", fontWeight:700, transition:"all 0.15s", boxShadow:`0 2px 8px ${PR}` }}>
                      Continue <IArrowR size={16} color="#fff" sw={2.25}/>
                    </button>
                  ) : (
                    <button type="button" onClick={handleSubmit} disabled={submitting}
                      style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0 1.5rem", height:"44px", borderRadius:"10px", border:"none", background: submitting ? "var(--pax-t4)" : P, cursor: submitting ? "not-allowed" : "pointer", color:"#fff", fontSize:"0.9375rem", fontWeight:700, transition:"all 0.15s", boxShadow: submitting ? "none" : `0 2px 8px ${PR}` }}>
                      {submitting ? "Submitting…" : <><ICheck size={16} color="#fff" sw={2.5}/> Submit Enquiry</>}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: sticky summary (desktop) */}
            {!isMobile && (
              <div style={{ position:"sticky", top:"76px" }}>
                <SummaryCard pricing={pricing} ctx={ctx} coverImage={venueImages[0] ?? coverImage} selectedPackage={selectedPackage} menuTab={menuTab} customMenuItems={customMenuItems} adultCount={adultCount}/>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile bottom pricing bar */}
      {isMobile && <MobileBottomBar pricing={pricing} showPanel={showMobilePanel} onToggle={() => setShowMobilePanel(p => !p)}/>}

      {/* Modals */}
      {showPkgModal && pendingPkg && <PackageModal pkg={pendingPkg} menuCategories={menuCategories} menuItems={menuItems} selections={tempPkgSel} setSelections={setTempPkgSel} onCancel={cancelPkg} onConfirm={confirmPkg}/>}
      {showCustomModal && <CustomMenuModal menuCategories={menuCategories} menuItems={menuItems} selected={tempCustomItems} setSelected={setTempCustomItems} onClose={() => setShowCustomModal(false)} onConfirm={confirmCustom} isMobile={isMobile}/>}
      {confirm && <ConfirmDialog title={confirm.title} message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)}/>}
      {showSuccess && <SuccessModal refNum={enquiryRef} onClose={handleSuccessClose}/>}
    </>
  );
}
