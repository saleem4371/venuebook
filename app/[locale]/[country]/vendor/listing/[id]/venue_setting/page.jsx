"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Globe, Shield, Calendar, Users, CreditCard,
  Clock, CheckCircle2, AlertTriangle, AlertCircle, Info,
  Settings, Lock, Zap, Star, ChevronRight, FileText,
} from "lucide-react";
import { getCategoryTheme } from "../steps/categoryTheme";

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY CONFIG
───────────────────────────────────────────────────────────────────────────── */
const CATEGORY_LABELS = {
  venues:      "Venue",
  farmstays:   "Farmstay",
  studios:     "Studio",
  workspaces:  "Workspace",
  rentals:     "Rental",
  experiences: "Experience",
};

/* Which sections each category exposes */
const CATEGORY_SECTIONS = {
  venues:      ["publication", "security", "reserve", "pax", "payment", "other"],
  farmstays:   ["publication", "security", "pax", "payment", "other"],
  studios:     ["publication", "security", "payment", "other"],
  workspaces:  ["publication", "security", "payment", "other"],
  rentals:     ["publication", "security", "pax", "payment", "other"],
  experiences: ["publication", "pax", "payment", "other"],
};

const ALL_SECTIONS = [
  { key: "publication", label: "Publication", icon: Globe,      desc: "Visibility, status & booking controls"  },
  { key: "security",    label: "Security",    icon: Shield,     desc: "Deposit & refund policies"              },
  { key: "reserve",     label: "Reserve",     icon: Calendar,   desc: "Hold slots & reservation amounts"       },
  { key: "pax",         label: "Pax",         icon: Users,      desc: "Per-person pricing & capacity"          },
  { key: "payment",     label: "Payment",     icon: CreditCard, desc: "Payment collection & advance options"   },
  { key: "other",       label: "Other",       icon: Clock,      desc: "Block dates & additional settings"      },
];

/* ─────────────────────────────────────────────────────────────────────────────
   TOKENS — layered surface system
───────────────────────────────────────────────────────────────────────────── */
function tokens(isDark) {
  return {
    bg:         isDark ? "#070b14"                 : "#eef2f7",
    sidebar:    isDark ? "#090e1a"                 : "#ffffff",
    header:     isDark ? "rgba(9,14,26,0.96)"      : "rgba(255,255,255,0.97)",
    panel:      isDark ? "#0f172a"                 : "#ffffff",
    panelHead:  isDark ? "#111827"                 : "#f8fafc",
    panelInner: isDark ? "#0d1424"                 : "#f1f5f9",
    border:     isDark ? "rgba(255,255,255,0.07)"  : "rgba(0,0,0,0.09)",
    borderSub:  isDark ? "rgba(255,255,255,0.04)"  : "rgba(0,0,0,0.05)",
    text:       isDark ? "#f1f5f9"                 : "#0f172a",
    sub:        isDark ? "#94a3b8"                 : "#475569",
    muted:      isDark ? "#4b5563"                 : "#9ca3af",
    inputBg:    isDark ? "#111827"                 : "#ffffff",
    inputBd:    isDark ? "rgba(255,255,255,0.10)"  : "rgba(0,0,0,0.12)",
    inputPfx:   isDark ? "rgba(255,255,255,0.03)"  : "rgba(0,0,0,0.03)",
    shadow:     isDark
      ? "0 2px 8px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.05)"
      : "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.07)",
    shadowMd:   isDark
      ? "0 8px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)"
      : "0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)",
    footer:     isDark ? "rgba(7,11,20,0.97)"      : "rgba(238,242,247,0.97)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function VenueSettings() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const category     = searchParams.get("category") ?? "venues";
  const catLabel     = CATEGORY_LABELS[category] ?? "Venue";

  /* Dark mode sync */
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const theme = getCategoryTheme(category);
  const tk    = tokens(isDark);

  /* Category-filtered sections */
  const sectionKeys = CATEGORY_SECTIONS[category] ?? CATEGORY_SECTIONS.venues;
  const sections    = ALL_SECTIONS.filter((s) => sectionKeys.includes(s.key));

  /* UI state */
  const [active,  setActive]  = useState(sectionKeys[0]);
  const [saved,   setSaved]   = useState({});
  const [saving,  setSaving]  = useState(false);
  const [valErr,  setValErr]  = useState("");

  const [kyc] = useState({ panVerify: 0, bankVerify: 0 });
  const kycVerified = kyc.panVerify === 2 && kyc.bankVerify === 2;

  const [form, setForm] = useState({
    status: "draft", pauseFrom: "", pauseTo: "",
    isBookingEnabled: true, isReserveEnabled: false, pricingModel: "venue",
    requireDeposit: false, depositAmount: 5000, refundPolicy: "full",
    refundPercent: 80, refundTimelineDays: 7,
    holdDurationHours: 24, reserveAmountType: "fixed",
    reserveFixedAmount: 2000, reservePercent: 20,
    isReserveRefundable: true, reserveRefundPercent: 100, deductFromFinal: true,
    enablePax: false, minPerPersonCharge: 500,
    enableExtraCharges: false, extraChargeType: "fixed",
    extraFixedCharge: 200, extraPercentCharge: 10,
    allowPartialPayments: false, advancePaymentPercent: 30,
    blockFrom: "", blockTo: "",
  });

  const updateForm = useCallback((key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSaved((prev) => ({ ...prev, [active]: false }));
    setValErr("");
  }, [active]);

  const isSectionComplete = (k) => saved[k] === true;
  const completedCount = sectionKeys.filter(isSectionComplete).length;
  const progress       = Math.round((completedCount / sectionKeys.length) * 100);
  const activeSection  = sections.find((s) => s.key === active) ?? sections[0];
  const currentIdx     = sectionKeys.indexOf(active);
  const ActiveIcon     = activeSection?.icon ?? Globe;

  const goTo = (key) => { setActive(key); setValErr(""); };

  const handleSave = async () => {
    if (active === "publication" && form.status !== "draft" && !kycVerified) {
      setValErr("Complete KYC verification before publishing."); return;
    }
    if (active === "publication" && form.status === "paused" && !form.pauseFrom) {
      setValErr("Select a pause start date."); return;
    }
    if (active === "security" && form.requireDeposit && !form.depositAmount) {
      setValErr("Enter a deposit amount."); return;
    }
    if (active === "other" && form.blockFrom && form.blockTo && form.blockFrom > form.blockTo) {
      setValErr("End date must be after start date."); return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 650));
    setSaving(false);
    setSaved((prev) => ({ ...prev, [active]: true }));
    setValErr("");
    if (currentIdx < sectionKeys.length - 1) {
      setTimeout(() => goTo(sectionKeys[currentIdx + 1]), 250);
    }
  };

  const sp = { theme, tk, isDark, form, update: updateForm, category };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: tk.bg }}>

      {/* ╔══════════════════════════════════════════
          SIDEBAR — management nav panel
      ══════════════════════════════════════════╗ */}
      <aside
        className="hidden md:flex w-64 xl:w-[272px] flex-col flex-shrink-0"
        style={{ background: tk.sidebar, borderRight: `1px solid ${tk.border}` }}
      >

        {/* Brand area */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${tk.border}` }}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-5 cursor-pointer transition-opacity duration-200 hover:opacity-70"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}
            >
              <ArrowLeft size={13} style={{ color: tk.sub }} />
            </div>
            <span className="text-[12px] font-medium" style={{ color: tk.sub }}>Back to Editor</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: theme.gradient }}
            >
              <Settings size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tk.muted }}>
                {catLabel} Management
              </p>
              <h2 className="text-[14px] font-bold leading-tight" style={{ color: tk.text }}>Settings Panel</h2>
            </div>
          </div>

          {/* Progress module */}
          <div
            className="px-4 py-3.5 rounded-xl"
            style={{
              background: `${theme.ring}0.07)`,
              border:     `1px solid ${theme.ring}0.18)`,
            }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold" style={{ color: tk.sub }}>Setup Progress</span>
              <span className="text-[13px] font-black" style={{ color: theme.accent }}>{progress}%</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: theme.gradient }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] mt-2" style={{ color: tk.muted }}>
              {completedCount} of {sectionKeys.length} sections complete
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 no-scrollbar space-y-0.5">
          {sections.map((section, idx) => {
            const isActive   = active === section.key;
            const isComplete = isSectionComplete(section.key);
            const Icon       = section.icon;

            return (
              <button
                key={section.key}
                onClick={() => goTo(section.key)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left cursor-pointer relative overflow-hidden transition-all duration-200"
                style={{
                  background: isActive ? `${theme.ring}0.10)` : "transparent",
                  border:     `1px solid ${isActive ? `${theme.ring}0.28)` : "transparent"}`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Active accent bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full"
                    style={{ background: theme.gradient }}
                  />
                )}

                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{
                    background: isActive
                      ? `${theme.ring}0.20)`
                      : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                  }}
                >
                  <Icon size={14} style={{ color: isActive ? theme.accent : tk.muted }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold leading-tight" style={{ color: isActive ? theme.accent : tk.sub }}>
                    {section.label}
                  </p>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: tk.muted }}>{section.desc}</p>
                </div>

                {isComplete ? (
                  <CheckCircle2 size={14} style={{ color: "#10b981" }} className="shrink-0" />
                ) : (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{
                      background: isActive
                        ? `${theme.ring}0.18)`
                        : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                      color: isActive ? theme.accent : tk.muted,
                    }}
                  >
                    {idx + 1}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer — listing identity */}
        <div className="flex-shrink-0 px-4 pb-4" style={{ borderTop: `1px solid ${tk.border}` }}>
          <div
            className="flex items-center gap-3 px-3.5 py-3 mt-3 rounded-xl"
            style={{
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${tk.border}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-[11px] font-black"
              style={{ background: theme.gradient }}
            >
              {catLabel[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold truncate" style={{ color: tk.text }}>{catLabel} Listing</p>
              <p className="text-[10px]" style={{ color: tk.muted }}>
                {kycVerified ? "KYC Verified ✓" : "KYC Pending"}
              </p>
            </div>
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: kycVerified ? "#10b981" : "#f59e0b" }}
            />
          </div>
        </div>
      </aside>

      {/* ╔══════════════════════════════════════════
          MAIN COLUMN
      ══════════════════════════════════════════╗ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ─── STICKY WORKSPACE HEADER ─── */}
        <div
          className="flex-shrink-0 sticky top-0 z-40"
          style={{
            background:           tk.header,
            backdropFilter:       "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom:         `1px solid ${tk.border}`,
          }}
        >
          {/* Desktop header */}
          <div className="hidden md:flex items-center justify-between px-7 py-3.5 gap-4">
            {/* Left: section identity */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: theme.gradient }}
              >
                <ActiveIcon size={14} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tk.muted }}>
                  {catLabel} · Management Panel
                </p>
                <h1 className="text-[15px] font-bold leading-tight" style={{ color: tk.text }}>
                  {activeSection?.label}
                </h1>
              </div>
            </div>

            {/* Right: status chips */}
            <div className="flex items-center gap-2 shrink-0">
              {/* KYC chip */}
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: kycVerified ? "rgba(16,185,129,0.09)" : "rgba(239,68,68,0.09)",
                  border:     `1px solid ${kycVerified ? "rgba(16,185,129,0.28)" : "rgba(239,68,68,0.28)"}`,
                }}
              >
                {kycVerified
                  ? <CheckCircle2 size={11} style={{ color: "#10b981" }} />
                  : <AlertCircle  size={11} style={{ color: "#ef4444" }} />
                }
                <span
                  className="text-[10px] font-bold"
                  style={{ color: kycVerified ? "#10b981" : "#ef4444" }}
                >
                  {kycVerified ? "KYC Verified" : "KYC Pending"}
                </span>
              </div>

              {/* Progress chip */}
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: `${theme.ring}0.09)`, border: `1px solid ${theme.ring}0.25)` }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
                <span className="text-[10px] font-bold" style={{ color: theme.accent }}>
                  {completedCount}/{sectionKeys.length} saved
                </span>
              </div>

              {/* Category badge */}
              <div
                className="px-3 py-1.5 rounded-full text-[10px] font-black text-white"
                style={{ background: theme.gradient }}
              >
                {catLabel}
              </div>
            </div>
          </div>

          {/* Mobile header */}
          <div className="md:hidden">
            <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
              <button onClick={() => router.back()} className="cursor-pointer" style={{ color: tk.sub }}>
                <ArrowLeft size={17} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tk.muted }}>{catLabel}</p>
                <p className="text-[14px] font-bold" style={{ color: tk.text }}>{activeSection?.label}</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: `${theme.ring}0.10)` }}>
                <span className="text-[10px] font-bold" style={{ color: theme.accent }}>{progress}%</span>
              </div>
            </div>
            {/* Mobile section tabs */}
            <div className="overflow-x-auto no-scrollbar px-4 pb-3">
              <div className="flex gap-1.5">
                {sections.map((s) => {
                  const Icon     = s.icon;
                  const isActive = active === s.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => goTo(s.key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all shrink-0"
                      style={
                        isActive
                          ? { background: theme.gradient, color: "#fff" }
                          : { background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", color: tk.sub }
                      }
                    >
                      <Icon size={10} /> {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Progress strip */}
          <div style={{ height: "2px", background: tk.borderSub }}>
            <motion.div
              style={{ height: "100%", background: theme.gradient }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* ─── SCROLLABLE CONTENT ─── */}
        <div className="flex-1 overflow-y-auto pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="px-5 sm:px-7 xl:px-10 py-7 max-w-3xl mx-auto w-full"
            >
              {active === "publication" && <PublicationSection {...sp} kycVerified={kycVerified} kyc={kyc} />}
              {active === "security"    && <SecuritySection    {...sp} />}
              {active === "reserve"     && <ReserveSection     {...sp} />}
              {active === "pax"         && <PaxSection         {...sp} />}
              {active === "payment"     && <PaymentSection     {...sp} />}
              {active === "other"       && <OtherSection       {...sp} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── STICKY FOOTER ─── */}
        <div
          className="fixed bottom-0 left-0 right-0 md:left-64 xl:left-[272px] z-50 flex-shrink-0"
          style={{
            background:           tk.footer,
            backdropFilter:       "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop:            `1px solid ${tk.border}`,
          }}
        >
          <div className="px-5 sm:px-7 xl:px-10 py-4 max-w-3xl mx-auto flex items-center justify-between gap-4">
            {/* Left: status messages */}
            <AnimatePresence mode="wait">
              {valErr ? (
                <motion.div key="err" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <AlertCircle size={14} style={{ color: "#ef4444" }} />
                  <p className="text-[12px] font-semibold" style={{ color: "#ef4444" }}>{valErr}</p>
                </motion.div>
              ) : isSectionComplete(active) ? (
                <motion.div key="ok" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 size={14} style={{ color: "#10b981" }} />
                  <p className="text-[12px] font-semibold" style={{ color: "#10b981" }}>Changes saved</p>
                </motion.div>
              ) : (
                <p key="hint" className="text-[12px]" style={{ color: tk.muted }}>{activeSection?.desc}</p>
              )}
            </AnimatePresence>

            {/* Right: navigation actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              {currentIdx > 0 && (
                <button
                  onClick={() => goTo(sectionKeys[currentIdx - 1])}
                  className="px-4 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer transition-all duration-200"
                  style={{
                    color:      tk.sub,
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    border:     `1px solid ${tk.border}`,
                  }}
                >
                  Back
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white cursor-pointer active:scale-[0.97] transition-all duration-200"
                style={{
                  background: saving ? tk.muted : theme.gradient,
                  boxShadow:  saving ? "none" : `0 2px 16px ${theme.ring}0.40)`,
                  opacity:    saving ? 0.65 : 1,
                }}
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : currentIdx < sectionKeys.length - 1 ? (
                  <>Save & Continue <ChevronRight size={13} /></>
                ) : (
                  <>Save Settings <CheckCircle2 size={13} /></>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STRUCTURAL PRIMITIVES
   DashPanel — single large panel per section (replaces multiple SettingCards)
   PanelSection — internal subsection with divider + label
═══════════════════════════════════════════════════════════════════════════ */

function DashPanel({ icon: Icon, title, desc, badge, tag, children, theme, tk }) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-shadow duration-300"
      style={{
        background:  tk.panel,
        border:      `1px solid ${tk.border}`,
        boxShadow:   tk.shadowMd,
      }}
    >
      {/* Panel header — elevated surface */}
      <div
        className="px-6 py-5"
        style={{ background: tk.panelHead, borderBottom: `1px solid ${tk.borderSub}` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {Icon && (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: theme.gradient }}
              >
                <Icon size={18} className="text-white" />
              </div>
            )}
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[15px] font-bold" style={{ color: tk.text }}>{title}</h3>
                {badge && (
                  <span
                    className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
                    style={{
                      background: `${theme.ring}0.12)`,
                      border:     `1px solid ${theme.ring}0.28)`,
                      color:      theme.accent,
                    }}
                  >
                    {badge}
                  </span>
                )}
                {tag && (
                  <span
                    className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
                    style={{ background: "rgba(16,185,129,0.11)", border: "1px solid rgba(16,185,129,0.26)", color: "#10b981" }}
                  >
                    {tag}
                  </span>
                )}
              </div>
              {desc && (
                <p className="text-[12px] mt-1 leading-relaxed" style={{ color: tk.sub }}>{desc}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panel body */}
      <div>{children}</div>
    </div>
  );
}

/* Internal panel subsection — always has a top border divider */
function PanelSection({ label, children, tk, noPad = false }) {
  return (
    <div
      style={{ borderTop: `1px solid ${tk.borderSub}` }}
      className={noPad ? "" : "px-6 py-5"}
    >
      {label && (
        <p
          className="text-[10px] font-black uppercase tracking-widest mb-4"
          style={{ color: tk.muted }}
        >
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

/* ─── Toggle row ─── */
function Toggle({ label, description, value, onChange, theme, tk, isDark, disabled = false }) {
  return (
    <div className="flex items-center justify-between gap-4 min-h-[44px] py-0.5">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold leading-tight" style={{ color: disabled ? tk.muted : tk.text }}>
          {label}
        </p>
        {description && (
          <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: tk.muted }}>{description}</p>
        )}
      </div>
      <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className="shrink-0 relative w-[48px] h-[27px] rounded-full transition-all duration-300 cursor-pointer"
        style={{
          background: value
            ? theme.gradient
            : isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.13)",
          opacity:   disabled ? 0.35 : 1,
          boxShadow: value ? `0 2px 10px ${theme.ring}0.32)` : "none",
        }}
      >
        <motion.div
          className="absolute top-[3.5px] w-[20px] h-[20px] rounded-full bg-white"
          style={{ boxShadow: "0 1px 5px rgba(0,0,0,0.28)" }}
          animate={{ left: value ? "24px" : "3.5px" }}
          transition={{ type: "spring", stiffness: 520, damping: 38 }}
        />
      </button>
    </div>
  );
}

/* ─── Number input ─── */
function NumberInput({ label, description, value, onChange, min, max, prefix, suffix, theme, tk }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wide mb-1.5" style={{ color: tk.muted }}>{label}</p>
      {description && <p className="text-[11px] mb-2.5 leading-relaxed" style={{ color: tk.muted }}>{description}</p>}
      <div
        className="flex items-stretch rounded-xl overflow-hidden"
        style={{ border: `1px solid ${tk.inputBd}`, background: tk.inputBg }}
      >
        {prefix && (
          <div
            className="flex items-center px-4 shrink-0"
            style={{ borderRight: `1px solid ${tk.inputBd}`, background: tk.inputPfx }}
          >
            <span className="text-[13px] font-bold" style={{ color: theme.accent }}>{prefix}</span>
          </div>
        )}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 px-4 py-3 text-[15px] font-bold bg-transparent outline-none"
          style={{ color: tk.text }}
        />
        {suffix && (
          <div
            className="flex items-center px-4 shrink-0"
            style={{ borderLeft: `1px solid ${tk.inputBd}`, background: tk.inputPfx }}
          >
            <span className="text-[12px] font-semibold" style={{ color: tk.muted }}>{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Date input ─── */
function DateInput({ label, value, onChange, tk }) {
  return (
    <div>
      {label && (
        <p className="text-[10px] font-black uppercase tracking-wide mb-1.5" style={{ color: tk.muted }}>{label}</p>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl text-[13px] font-semibold outline-none"
        style={{
          background:  tk.inputBg,
          border:      `1px solid ${tk.inputBd}`,
          color:       tk.text,
          colorScheme: "dark",
        }}
      />
    </div>
  );
}

/* ─── Compact radio card — works in 2-3 col grids ─── */
function RadioCard({ label, desc, value, selected, onSelect, theme, tk, isDark }) {
  const on = selected === value;
  return (
    <button
      onClick={() => onSelect(value)}
      className="text-left px-4 py-4 rounded-xl transition-all duration-200 cursor-pointer"
      style={{
        background: on
          ? `${theme.ring}0.09)`
          : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
        border: `1.5px solid ${on ? theme.accent : tk.border}`,
        boxShadow: on ? `0 0 0 3px ${theme.ring}0.10)` : "none",
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200"
          style={{ borderColor: on ? theme.accent : tk.muted }}
        >
          {on && <div className="w-2 h-2 rounded-full" style={{ background: theme.accent }} />}
        </div>
        <div>
          <p className="text-[13px] font-bold leading-tight" style={{ color: on ? theme.accent : tk.text }}>{label}</p>
          {desc && <p className="text-[11px] mt-0.5 leading-snug" style={{ color: tk.muted }}>{desc}</p>}
        </div>
      </div>
    </button>
  );
}

/* ─── Status card — compact vertical, for 3-col grid ─── */
function StatusCard({ label, desc, value, selected, onSelect, disabled, icon: Icon, theme, tk, isDark }) {
  const on = selected === value;
  return (
    <button
      onClick={() => !disabled && onSelect(value)}
      disabled={disabled}
      className="text-left p-4 rounded-xl transition-all duration-200 flex flex-col gap-2.5"
      style={{
        cursor:     disabled ? "not-allowed" : "pointer",
        background: on
          ? `${theme.ring}0.10)`
          : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
        border:    `1.5px solid ${on ? theme.accent : tk.border}`,
        boxShadow: on ? `0 0 0 3px ${theme.ring}0.10), 0 4px 16px ${theme.ring}0.12)` : "none",
        opacity:   disabled ? 0.45 : 1,
      }}
    >
      {/* Icon + lock */}
      <div className="flex items-center justify-between">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: on
              ? `${theme.ring}0.18)`
              : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          }}
        >
          <Icon size={15} style={{ color: on ? theme.accent : tk.muted }} />
        </div>
        {disabled && <Lock size={11} style={{ color: tk.muted }} />}
      </div>

      {/* Label */}
      <div>
        <p className="text-[13px] font-bold leading-tight" style={{ color: on ? theme.accent : tk.text }}>{label}</p>
        <p className="text-[11px] mt-0.5 leading-snug" style={{ color: tk.muted }}>{desc}</p>
      </div>

      {/* Radio indicator */}
      <div
        className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200"
        style={{ borderColor: on ? theme.accent : tk.muted }}
      >
        {on && <div className="w-2 h-2 rounded-full" style={{ background: theme.accent }} />}
      </div>
    </button>
  );
}

/* ─── Booking option row — compact inline layout ─── */
function BookingRow({ label, desc, alwaysOn, enabled, onToggle, icon: Icon, theme, tk, isDark }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
      style={{
        background: enabled
          ? `${theme.ring}0.07)`
          : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
        border: `1.5px solid ${enabled ? `${theme.ring}0.22)` : tk.border}`,
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all"
        style={{
          background: enabled
            ? `${theme.ring}0.18)`
            : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        }}
      >
        <Icon size={14} style={{ color: enabled ? theme.accent : tk.muted }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold" style={{ color: enabled ? theme.accent : tk.text }}>{label}</p>
        <p className="text-[11px] mt-0.5" style={{ color: tk.muted }}>{desc}</p>
      </div>

      {alwaysOn ? (
        <span
          className="text-[10px] font-black px-2.5 py-1 rounded-full shrink-0"
          style={{ background: "rgba(16,185,129,0.11)", color: "#10b981" }}
        >
          Always On
        </span>
      ) : (
        <button
          onClick={() => onToggle(!enabled)}
          className="shrink-0 relative w-[46px] h-[26px] rounded-full cursor-pointer transition-all duration-300"
          style={{
            background: enabled
              ? theme.gradient
              : isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)",
            boxShadow: enabled ? `0 2px 8px ${theme.ring}0.28)` : "none",
          }}
        >
          <motion.div
            className="absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
            animate={{ left: enabled ? "23px" : "3px" }}
            transition={{ type: "spring", stiffness: 520, damping: 38 }}
          />
        </button>
      )}
    </div>
  );
}

/* ─── Thin inner divider ─── */
function ControlDivider({ tk }) {
  return <div className="my-1" style={{ height: "1px", background: tk.borderSub }} />;
}

/* ═══════════════════════════════════════════════════════════════════════════
   KYC COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

function KycBadge({ label, status }) {
  const MAP = {
    0: { color: "#ef4444", bg: "rgba(239,68,68,0.10)",   text: "Unverified" },
    1: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  text: "In Review"  },
    2: { color: "#10b981", bg: "rgba(16,185,129,0.10)",  text: "Verified"   },
  };
  const s = MAP[status] ?? MAP[0];
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      <span className="text-[11px] font-bold" style={{ color: s.color }}>{label}</span>
      <span
        className="text-[9px] font-black px-2 py-0.5 rounded-full"
        style={{ background: s.bg, color: s.color }}
      >
        {s.text}
      </span>
    </div>
  );
}

function KycBanner({ kyc, tk, isDark }) {
  const panOk  = kyc.panVerify  === 2;
  const bankOk = kyc.bankVerify === 2;
  if (panOk && bankOk) return null;

  const inProgress  = kyc.panVerify === 1 || kyc.bankVerify === 1;
  const color       = inProgress ? "#f59e0b"       : "#ef4444";
  const bg          = inProgress ? "rgba(245,158,11," : "rgba(239,68,68,";

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: `${bg}0.07)`,
        border:     `1px solid ${bg}0.25)`,
      }}
    >
      <div className="flex items-start gap-3.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${bg}0.15)` }}
        >
          <AlertTriangle size={17} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold mb-1" style={{ color }}>
            {inProgress ? "KYC Verification In Progress" : "KYC Verification Required"}
          </p>
          <p className="text-[12px] leading-relaxed mb-3" style={{ color: isDark ? "#94a3b8" : "#475569" }}>
            {inProgress
              ? "Your documents are being reviewed. Publishing unlocks once verification is complete."
              : "Complete PAN and bank verification to publish your listing and receive payouts."
            }
          </p>
          <div className="flex gap-4 flex-wrap">
            <KycBadge label="PAN Card"   status={kyc.panVerify}  />
            <KycBadge label="Bank Account" status={kyc.bankVerify} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLICATION SECTION
   Single DashPanel with 3 PanelSections:
   1. Listing Status (3-col StatusCard grid + pause dates)
   2. Booking Options (BookingRow list)
   3. Pricing Model (3-col RadioCard grid)
═══════════════════════════════════════════════════════════════════════════ */

function PublicationSection({ form, update, theme, tk, isDark, kycVerified, kyc }) {
  const statusBadge = {
    draft:     { label: "Draft",     color: tk.muted  },
    published: { label: "Published", color: "#10b981" },
    paused:    { label: "Paused",    color: "#f59e0b" },
  }[form.status] ?? { label: "Draft", color: tk.muted };

  return (
    <div className="space-y-5">

      {/* KYC Banner */}
      <KycBanner kyc={kyc} tk={tk} isDark={isDark} />

      {/* Main Publication Panel */}
      <DashPanel
        icon={Globe}
        title="Publication Control"
        desc="Manage how and when your listing accepts bookings from guests."
        badge={statusBadge.label}
        theme={theme} tk={tk}
      >

        {/* ── 1. Listing Status ── */}
        <PanelSection label="Listing Status" tk={tk}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <StatusCard
              label="Draft"
              desc="Hidden from guests. Edit freely."
              value="draft"
              selected={form.status}
              onSelect={(v) => update("status", v)}
              icon={FileText}
              theme={theme} tk={tk} isDark={isDark}
            />
            <StatusCard
              label="Published"
              desc="Live and bookable by guests."
              value="published"
              selected={form.status}
              onSelect={(v) => update("status", v)}
              disabled={!kycVerified}
              icon={Globe}
              theme={theme} tk={tk} isDark={isDark}
            />
            <StatusCard
              label="Paused"
              desc="Temporarily hidden with resume date."
              value="paused"
              selected={form.status}
              onSelect={(v) => update("status", v)}
              disabled={!kycVerified}
              icon={Clock}
              theme={theme} tk={tk} isDark={isDark}
            />
          </div>

          {/* Pause date pickers */}
          <AnimatePresence>
            {form.status === "paused" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-4 p-4 rounded-xl grid grid-cols-2 gap-3"
                  style={{ background: tk.panelInner, border: `1px solid ${tk.borderSub}` }}
                >
                  <DateInput label="Pause From"  value={form.pauseFrom} onChange={(v) => update("pauseFrom", v)} tk={tk} />
                  <DateInput label="Pause Until" value={form.pauseTo}   onChange={(v) => update("pauseTo",   v)} tk={tk} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PanelSection>

        {/* ── 2. Booking Options ── */}
        <PanelSection label="Booking Options" tk={tk}>
          <div className="space-y-2">
            <BookingRow
              label="Enquiry"
              desc="Guests can send questions and enquiries."
              alwaysOn enabled={true}
              icon={Info}
              theme={theme} tk={tk} isDark={isDark}
            />
            <BookingRow
              label="Booking"
              desc="Accept direct confirmed bookings from guests."
              enabled={form.isBookingEnabled}
              onToggle={(v) => update("isBookingEnabled", v)}
              icon={Zap}
              theme={theme} tk={tk} isDark={isDark}
            />
            <BookingRow
              label="Reserve"
              desc="Allow guests to hold a slot with a partial payment."
              enabled={form.isReserveEnabled}
              onToggle={(v) => update("isReserveEnabled", v)}
              icon={Star}
              theme={theme} tk={tk} isDark={isDark}
            />
          </div>
        </PanelSection>

        {/* ── 3. Pricing Model ── */}
        <PanelSection label="Pricing Model" tk={tk}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <RadioCard
              label="Venue"
              desc="Fixed price per booking"
              value="venue"
              selected={form.pricingModel}
              onSelect={(v) => update("pricingModel", v)}
              theme={theme} tk={tk} isDark={isDark}
            />
            <RadioCard
              label="Pax"
              desc="Rate × guest count"
              value="pax"
              selected={form.pricingModel}
              onSelect={(v) => update("pricingModel", v)}
              theme={theme} tk={tk} isDark={isDark}
            />
            <RadioCard
              label="Both"
              desc="Venue + per-person charge"
              value="both"
              selected={form.pricingModel}
              onSelect={(v) => update("pricingModel", v)}
              theme={theme} tk={tk} isDark={isDark}
            />
          </div>
        </PanelSection>

      </DashPanel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECURITY SECTION
   Single DashPanel with:
   1. Deposit toggle
   2. (Conditional) Amount + Refund Policy + Timeline
═══════════════════════════════════════════════════════════════════════════ */

function SecuritySection({ form, update, theme, tk, isDark }) {
  return (
    <DashPanel
      icon={Shield}
      title="Security Deposit"
      desc="Require a damage deposit held in escrow until after the event."
      badge={form.requireDeposit ? "Active" : undefined}
      theme={theme} tk={tk}
    >

      {/* Toggle row */}
      <PanelSection tk={tk}>
        <Toggle
          label="Require Security Deposit"
          description="Guests pay an additional deposit at booking — returned after the event."
          value={form.requireDeposit}
          onChange={(v) => update("requireDeposit", v)}
          theme={theme} tk={tk} isDark={isDark}
        />
      </PanelSection>

      {/* Conditional deposit settings */}
      <AnimatePresence>
        {form.requireDeposit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Deposit amount */}
            <PanelSection label="Deposit Amount" tk={tk}>
              <NumberInput
                label="Fixed Deposit Amount"
                value={form.depositAmount}
                onChange={(v) => update("depositAmount", v)}
                min={0}
                prefix="₹"
                theme={theme} tk={tk}
              />
            </PanelSection>

            {/* Refund policy */}
            <PanelSection label="Refund Policy" tk={tk}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <RadioCard
                  label="Full Refund"
                  desc="100% returned after event"
                  value="full"
                  selected={form.refundPolicy}
                  onSelect={(v) => update("refundPolicy", v)}
                  theme={theme} tk={tk} isDark={isDark}
                />
                <RadioCard
                  label="Partial Refund"
                  desc="Percentage returned based on conditions"
                  value="partial"
                  selected={form.refundPolicy}
                  onSelect={(v) => update("refundPolicy", v)}
                  theme={theme} tk={tk} isDark={isDark}
                />
                <RadioCard
                  label="Non-Refundable"
                  desc="Retained regardless of outcome"
                  value="none"
                  selected={form.refundPolicy}
                  onSelect={(v) => update("refundPolicy", v)}
                  theme={theme} tk={tk} isDark={isDark}
                />
              </div>

              {/* Conditional refund % */}
              <AnimatePresence>
                {form.refundPolicy === "partial" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <NumberInput
                      label="Refund Percentage"
                      value={form.refundPercent}
                      onChange={(v) => update("refundPercent", v)}
                      min={1} max={99}
                      suffix="%"
                      theme={theme} tk={tk}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </PanelSection>

            {/* Refund timeline */}
            <PanelSection label="Processing Timeline" tk={tk}>
              <NumberInput
                label="Refund Timeline"
                description="Days after the event within which the deposit refund is processed."
                value={form.refundTimelineDays}
                onChange={(v) => update("refundTimelineDays", v)}
                min={1}
                suffix="days"
                theme={theme} tk={tk}
              />
            </PanelSection>
          </motion.div>
        )}
      </AnimatePresence>

    </DashPanel>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESERVE SECTION
═══════════════════════════════════════════════════════════════════════════ */

function ReserveSection({ form, update, theme, tk, isDark }) {
  /* Empty state — Reserve booking option not enabled */
  if (!form.isReserveEnabled) {
    return (
      <div
        className="rounded-2xl flex flex-col items-center justify-center gap-4 py-16 px-8 text-center"
        style={{ background: tk.panel, border: `1px solid ${tk.border}`, boxShadow: tk.shadowMd }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: `${theme.ring}0.10)`, border: `1px solid ${theme.ring}0.22)` }}
        >
          <Calendar size={24} style={{ color: theme.accent }} />
        </div>
        <div className="max-w-xs">
          <p className="text-[16px] font-bold mb-2" style={{ color: tk.text }}>Reserve Not Enabled</p>
          <p className="text-[13px] leading-relaxed" style={{ color: tk.sub }}>
            Enable the <strong>Reserve</strong> booking option in{" "}
            <strong>Publication</strong> to configure reservation hold settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashPanel
      icon={Calendar}
      title="Reserve Settings"
      desc="Configure how guests hold a slot before committing to a full booking."
      theme={theme} tk={tk}
    >

      {/* Hold duration */}
      <PanelSection label="Hold Duration" tk={tk}>
        <NumberInput
          label="Slot Hold Time"
          description="How long a slot is reserved before auto-cancellation if not converted to a booking."
          value={form.holdDurationHours}
          onChange={(v) => update("holdDurationHours", v)}
          min={1} max={168}
          suffix="hours"
          theme={theme} tk={tk}
        />
      </PanelSection>

      {/* Reserve amount */}
      <PanelSection label="Reserve Amount" tk={tk}>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <RadioCard
            label="Fixed Amount"
            desc="Flat fee to secure the slot"
            value="fixed"
            selected={form.reserveAmountType}
            onSelect={(v) => update("reserveAmountType", v)}
            theme={theme} tk={tk} isDark={isDark}
          />
          <RadioCard
            label="Percentage"
            desc="% of total booking cost"
            value="percentage"
            selected={form.reserveAmountType}
            onSelect={(v) => update("reserveAmountType", v)}
            theme={theme} tk={tk} isDark={isDark}
          />
        </div>

        <AnimatePresence mode="wait">
          {form.reserveAmountType === "fixed" ? (
            <motion.div key="fix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NumberInput
                label="Reserve Amount"
                value={form.reserveFixedAmount}
                onChange={(v) => update("reserveFixedAmount", v)}
                min={0} prefix="₹"
                theme={theme} tk={tk}
              />
            </motion.div>
          ) : (
            <motion.div key="pct" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NumberInput
                label="Reserve Percentage"
                value={form.reservePercent}
                onChange={(v) => update("reservePercent", v)}
                min={1} max={100} suffix="%"
                theme={theme} tk={tk}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </PanelSection>

      {/* Refund & deduction */}
      <PanelSection label="Refund & Deduction Rules" tk={tk}>
        <div className="space-y-4">
          <Toggle
            label="Refundable Reserve"
            description="Return the reserve amount if guest cancels their booking."
            value={form.isReserveRefundable}
            onChange={(v) => update("isReserveRefundable", v)}
            theme={theme} tk={tk} isDark={isDark}
          />

          <AnimatePresence>
            {form.isReserveRefundable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pl-0"
              >
                <NumberInput
                  label="Refund Percentage"
                  value={form.reserveRefundPercent}
                  onChange={(v) => update("reserveRefundPercent", v)}
                  min={1} max={100} suffix="%"
                  theme={theme} tk={tk}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <ControlDivider tk={tk} />

          <Toggle
            label="Deduct from Final Payment"
            description="Reserve amount is credited toward the remaining balance on full booking."
            value={form.deductFromFinal}
            onChange={(v) => update("deductFromFinal", v)}
            theme={theme} tk={tk} isDark={isDark}
          />
        </div>
      </PanelSection>

    </DashPanel>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAX SECTION
═══════════════════════════════════════════════════════════════════════════ */

function PaxSection({ form, update, theme, tk, isDark }) {
  return (
    <DashPanel
      icon={Users}
      title="Pax & Per-Person Pricing"
      desc="Configure per-person charges and additional pax fee structures."
      badge={form.enablePax ? "Active" : undefined}
      theme={theme} tk={tk}
    >

      {/* Enable toggle */}
      <PanelSection tk={tk}>
        <Toggle
          label="Enable Pax Pricing"
          description="Charge guests on a per-person basis in addition to or instead of a flat fee."
          value={form.enablePax}
          onChange={(v) => update("enablePax", v)}
          theme={theme} tk={tk} isDark={isDark}
        />
      </PanelSection>

      {/* Conditional pax settings */}
      <AnimatePresence>
        {form.enablePax && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >

            {/* Base charge */}
            <PanelSection label="Base Per-Person Charge" tk={tk}>
              <NumberInput
                label="Minimum Per-Person Rate"
                value={form.minPerPersonCharge}
                onChange={(v) => update("minPerPersonCharge", v)}
                min={0} prefix="₹"
                theme={theme} tk={tk}
              />
            </PanelSection>

            {/* Extra charges */}
            <PanelSection label="Extra Pax Charges" tk={tk}>
              <Toggle
                label="Enable Extra Pax Charges"
                description="Add fees for guests beyond a defined base group size."
                value={form.enableExtraCharges}
                onChange={(v) => update("enableExtraCharges", v)}
                theme={theme} tk={tk} isDark={isDark}
              />

              <AnimatePresence>
                {form.enableExtraCharges && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-4 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-2.5">
                      <RadioCard
                        label="Fixed"
                        desc="Flat fee per extra guest"
                        value="fixed"
                        selected={form.extraChargeType}
                        onSelect={(v) => update("extraChargeType", v)}
                        theme={theme} tk={tk} isDark={isDark}
                      />
                      <RadioCard
                        label="Percentage"
                        desc="% of base per-person rate"
                        value="percentage"
                        selected={form.extraChargeType}
                        onSelect={(v) => update("extraChargeType", v)}
                        theme={theme} tk={tk} isDark={isDark}
                      />
                    </div>
                    <AnimatePresence mode="wait">
                      {form.extraChargeType === "fixed" ? (
                        <motion.div key="ef" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <NumberInput
                            label="Extra Charge per Person"
                            value={form.extraFixedCharge}
                            onChange={(v) => update("extraFixedCharge", v)}
                            min={0} prefix="₹"
                            theme={theme} tk={tk}
                          />
                        </motion.div>
                      ) : (
                        <motion.div key="ep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <NumberInput
                            label="Extra Charge Rate"
                            value={form.extraPercentCharge}
                            onChange={(v) => update("extraPercentCharge", v)}
                            min={1} max={100} suffix="%"
                            theme={theme} tk={tk}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </PanelSection>

          </motion.div>
        )}
      </AnimatePresence>

    </DashPanel>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAYMENT SECTION
═══════════════════════════════════════════════════════════════════════════ */

function PaymentSection({ form, update, theme, tk, isDark }) {
  return (
    <DashPanel
      icon={CreditCard}
      title="Payment Options"
      desc="Configure advance collection and partial payment policies."
      badge={form.allowPartialPayments ? "Partial Payments On" : undefined}
      theme={theme} tk={tk}
    >

      <PanelSection tk={tk}>
        <Toggle
          label="Allow Partial Payments"
          description="Guests pay an advance now and the remaining balance closer to the event date."
          value={form.allowPartialPayments}
          onChange={(v) => update("allowPartialPayments", v)}
          theme={theme} tk={tk} isDark={isDark}
        />
      </PanelSection>

      <AnimatePresence>
        {form.allowPartialPayments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <PanelSection label="Advance Collection" tk={tk}>
              <NumberInput
                label="Advance Payment Required"
                description="Percentage of total booking cost collected at time of confirmation."
                value={form.advancePaymentPercent}
                onChange={(v) => update("advancePaymentPercent", v)}
                min={1} max={99} suffix="%"
                theme={theme} tk={tk}
              />
              {/* Visual preview */}
              <div
                className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl"
                style={{
                  background: `${theme.ring}0.06)`,
                  border:     `1px solid ${theme.ring}0.18)`,
                }}
              >
                <div className="text-center">
                  <p className="text-[11px]" style={{ color: tk.muted }}>At Booking</p>
                  <p className="text-[16px] font-black" style={{ color: theme.accent }}>
                    {form.advancePaymentPercent}%
                  </p>
                </div>
                <div className="h-px flex-1 mx-4" style={{ background: tk.borderSub }} />
                <div className="text-center">
                  <p className="text-[11px]" style={{ color: tk.muted }}>Remaining</p>
                  <p className="text-[16px] font-black" style={{ color: tk.sub }}>
                    {100 - form.advancePaymentPercent}%
                  </p>
                </div>
              </div>
            </PanelSection>
          </motion.div>
        )}
      </AnimatePresence>

    </DashPanel>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   OTHER SECTION
═══════════════════════════════════════════════════════════════════════════ */

function OtherSection({ form, update, theme, tk, isDark }) {
  const hasRange   = form.blockFrom && form.blockTo;
  const validRange = hasRange && form.blockFrom <= form.blockTo;

  return (
    <DashPanel
      icon={Clock}
      title="Other Settings"
      desc="Block specific date ranges and configure additional listing behaviour."
      theme={theme} tk={tk}
    >

      <PanelSection label="Date Blocking" tk={tk}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <DateInput
            label="Block From"
            value={form.blockFrom}
            onChange={(v) => update("blockFrom", v)}
            tk={tk}
          />
          <DateInput
            label="Block Until"
            value={form.blockTo}
            onChange={(v) => update("blockTo", v)}
            tk={tk}
          />
        </div>

        {/* Active block period preview */}
        <AnimatePresence>
          {validRange && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: `${theme.ring}0.07)`,
                border:     `1px solid ${theme.ring}0.20)`,
              }}
            >
              <Clock size={13} style={{ color: theme.accent }} />
              <div>
                <p className="text-[11px] font-bold" style={{ color: theme.accent }}>
                  Block Active
                </p>
                <p className="text-[12px]" style={{ color: tk.sub }}>
                  {new Date(form.blockFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" → "}
                  {new Date(form.blockTo).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </motion.div>
          )}
          {hasRange && !validRange && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)" }}
            >
              <AlertCircle size={13} style={{ color: "#ef4444" }} />
              <p className="text-[12px] font-medium" style={{ color: "#ef4444" }}>
                End date must be after start date
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </PanelSection>

    </DashPanel>
  );
}
