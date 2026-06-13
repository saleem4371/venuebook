"use client";

/**
 * KYCModal — VenueBook KYC Verification Experience.
 *
 * Design: Premium document-style certificates — PAN (Income Tax), Aadhaar (UIDAI),
 * Bank. No duplicate tables. No dark fintech cards. 5-step flow.
 *
 * Outside-click: LOCKED — cannot dismiss during KYC.
 * Progress: persisted in localStorage so users can return mid-flow.
 *
 * Certificate style inspired by:
 *   · Razorpay Business Onboarding
 *   · Cashfree Merchant KYC
 *   · Stripe Connect Verification
 *   · Zoho Payments Merchant Verification
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal }           from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShieldCheck, CreditCard, Fingerprint, Landmark,
  Upload, CheckCircle2, Clock, ChevronRight, ChevronLeft,
  AlertCircle, RefreshCw, Phone, BadgeCheck, FileText,
  XCircle, Shield, CheckCheck,
} from "lucide-react";

import {
  verifyPAN, sendAadhaarOTP, verifyAadhaarOTP,
  verifyBank, validateDocument,
} from "@/services/kycVerification";

import { SubmitKYC, each_kyc_status } from "@/services/kyc.service";

/* ─── Design tokens ──────────────────────────────────────────────── */
const KYC_KEY   = "vb_kyc_v4";
const GRAD      = "linear-gradient(242deg,#a44bf3,#499ce8)";
const GRAD_SOFT = "linear-gradient(242deg,rgba(164,75,243,0.08),rgba(73,156,232,0.08))";

const STEPS = [
  { id: 1, label: "Company PAN",  icon: CreditCard  },
  { id: 2, label: "Aadhaar",      icon: Fingerprint },
  { id: 3, label: "Bank Account", icon: Landmark    },
  { id: 4, label: "Company PAN",  icon: Upload      },
  { id: 5, label: "Review",       icon: ShieldCheck },
];

/* ─── Motion presets ─────────────────────────────────────────────── */
const BACK_A  = { initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}, transition:{duration:0.2} };
const MODAL_A = {
  initial:{ opacity:0, scale:0.97, y:16 },
  animate:{ opacity:1, scale:1,    y:0  },
  exit:   { opacity:0, scale:0.97, y:16 },
  transition:{ duration:0.28, ease:[0.16,1,0.3,1] },
};
const slide = (d) => ({
  initial:{ opacity:0, x: d * 20 },
  animate:{ opacity:1, x: 0      },
  exit:   { opacity:0, x: d * -20 },
  transition:{ duration:0.22, ease:[0.16,1,0.3,1] },
});
const fadeUp = {
  initial:{ opacity:0, y:10 }, animate:{ opacity:1, y:0 }, exit:{ opacity:0, y:-10 },
  transition:{ duration:0.22, ease:[0.16,1,0.3,1] },
};
const certAnim = {
  initial:{ opacity:0, y:20, scale:0.97 },
  animate:{ opacity:1, y:0,  scale:1    },
  transition:{ duration:0.45, ease:[0.16,1,0.3,1] },
};

/* ════════════════════════════════════════════════════════════════════
   ROOT MODAL COMPONENT
════════════════════════════════════════════════════════════════════ */
export default function KYCModal({ open, setOpen }) {
  const [step,      setStep]      = useState(1);
  const [dir,       setDir]       = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const [panData,     setPanData]     = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [bankData,    setBankData]    = useState(null);
  const [docData,     setDocData]     = useState(null);

  /* ── Restore from localStorage ─────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    try {
      const s = JSON.parse(localStorage.getItem(KYC_KEY) || "{}");
      if (s.panData)     setPanData(s.panData);
      if (s.aadhaarData) setAadhaarData(s.aadhaarData);
      if (s.bankData)    setBankData(s.bankData);
      if (s.docData)     setDocData(s.docData);
      if (s.step > 1)    setStep(s.step);
    } catch { /* noop */ }
  }, [open]);

  /* ── Persist to localStorage ───────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem(KYC_KEY, JSON.stringify({
        panData, aadhaarData, bankData,
        docData: docData
          ? { match:docData.match, fileName:docData.file?.name ?? docData.fileName, message:docData.message }
          : null,
        step,
      }));
    } catch { /* noop */ }
  }, [panData, aadhaarData, bankData, docData, step, open]);

  /* ── Pre-fill from backend if already verified ──────────────────── */
  useEffect(() => {
    if (!open) return;
    each_kyc_status().then(res => {
      const d = res?.data;
      if (!d) return;
      if (d?.pan?.status === "verified" && !panData)
        setPanData({ pan_number:d.pan.document_number, company_name:d.pan.company_name,
          status:"Active", business_category:d.pan.business_category,
          registered_address:d.pan.registered_address, fromBackend:true });
      if (d?.aadhaar?.status === "verified" && !aadhaarData)
        setAadhaarData({ full_name:d.aadhaar.name, dob:d.aadhaar.dob, gender:d.aadhaar.gender,
          address:d.aadhaar.address, aadhaar_number:d.aadhaar.masked_number ?? "XXXX XXXX XXXX",
          fromBackend:true });
      if (d?.bank?.status === "verified" && !bankData)
        setBankData({ account_holder:d.bank.account_holder_name, bank_name:d.bank.bank_name,
          branch:d.bank.branch, account_masked:"xxxx xxxx "+d.bank.account_number?.slice(-4),
          ifsc:d.bank.ifsc, status:"Verified", fromBackend:true });
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const progress = {
    1: !!panData,
    2: !!aadhaarData,
    3: !!bankData,
    4: !!(docData?.file || docData?.fileName),
  };

  const canAdvance = useCallback(() => {
    if (step === 1) return !!panData;
    if (step === 2) return !!aadhaarData;
    if (step === 3) return !!bankData;
    if (step === 4) return !!(docData?.file || docData?.fileName);
    return true;
  }, [step, panData, aadhaarData, bankData, docData]);

  const goNext = () => { if (!canAdvance()) return; setDir(1);  setStep(s => Math.min(s + 1, 5)); };
  const goBack = () => {                             setDir(-1); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      if (docData?.file instanceof File)  fd.append("panFile",  docData.file);
      if (panData?.pan_number)            fd.append("pan",       panData.pan_number);
      if (bankData?.account_masked)       fd.append("accountNo", bankData.account_masked);
      if (bankData?.ifsc)                 fd.append("ifsc",      bankData.ifsc);
      await SubmitKYC(fd);
      localStorage.removeItem(KYC_KEY);
      setSubmitted(true);
    } catch(e) { console.error("[KYCModal]", e); }
    finally    { setLoading(false); }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => { setSubmitted(false); setLoading(false); }, 320);
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">

          {/* Backdrop — intentionally NO onClick handler */}
          <motion.div {...BACK_A}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

          {/* Modal shell */}
          <motion.div {...MODAL_A}
            onClick={e => e.stopPropagation()}
            className={[
              "relative z-10 w-full sm:max-w-[940px]",
              "bg-white dark:bg-gray-950",
              "rounded-t-3xl sm:rounded-2xl overflow-hidden",
              "border-0 sm:border sm:border-gray-200/70 dark:sm:border-gray-800",
              "shadow-2xl shadow-black/20 dark:shadow-black/60",
              "flex flex-col",
              "h-[96svh] sm:h-[680px] max-h-[96svh] sm:max-h-[90vh]",
            ].join(" ")}>

            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="h-1.5 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Header */}
            <KYCHeader submitted={submitted} step={step} onClose={handleClose} />

            {/* Mobile horizontal stepper */}
            {!submitted && (
              <div className="sm:hidden px-5 pb-3 shrink-0 border-b border-gray-100 dark:border-gray-800">
                <HorizontalStepper currentStep={step} progress={progress} />
              </div>
            )}

            {/* Two-column body */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

              {/* ── Left sidebar (desktop only) ─────────────────── */}
              {!submitted && (
                <aside className="hidden sm:flex flex-col w-[216px] shrink-0 border-r border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/20 py-6 px-5 gap-5">
                  <VerticalStepper currentStep={step} progress={progress} />
                  <ProgressSummary progress={progress} />
                </aside>
              )}

              {/* ── Right scrollable content ────────────────────── */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="px-6 sm:px-8 pt-6 pb-5">
                  <AnimatePresence mode="wait" initial={false}>
                    {submitted ? (
                      <motion.div key="done" {...slide(1)}>
                        <SubmittedView onClose={handleClose} />
                      </motion.div>
                    ) : (
                      <motion.div key={step} {...slide(dir)}>
                        {step === 1 && <Step1PAN     panData={panData}         setPanData={setPanData} />}
                        {step === 2 && <Step2Aadhaar aadhaarData={aadhaarData} setAadhaarData={setAadhaarData} />}
                        {step === 3 && <Step3Bank    bankData={bankData}       setBankData={setBankData} />}
                        {step === 4 && <Step4Doc     docData={docData}         setDocData={setDocData} panData={panData} />}
                        {step === 5 && <Step5Review  panData={panData}         aadhaarData={aadhaarData} bankData={bankData} docData={docData} />}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Footer */}
            {!submitted && (
              <KYCFooter step={step} loading={loading} canAdvance={canAdvance()}
                onBack={goBack} onNext={goNext} onSubmit={handleSubmit} />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ─────────────────────────────────────────────────────────────────────
   HEADER
───────────────────────────────────────────────────────────────────── */
function KYCHeader({ submitted, step, onClose }) {
  return (
    <div className="flex items-center justify-between px-7 sm:px-10 py-4 shrink-0 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ background: GRAD }}>
          <ShieldCheck size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
            {submitted ? "Verification Submitted" : "KYC Verification"}
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">
            {submitted
              ? "Your documents are under review"
              : `Step ${step} of ${STEPS.length} · Secured with 256-bit encryption`}
          </p>
        </div>
      </div>
      <button type="button" onClick={onClose} aria-label="Close"
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer focus:outline-none">
        <X size={15} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   VERTICAL STEPPER  (sidebar)
───────────────────────────────────────────────────────────────────── */
function VerticalStepper({ currentStep, progress }) {
  return (
    <nav>
      {STEPS.map((s, i) => {
        const done   = progress[s.id] || s.id < currentStep;
        const active = s.id === currentStep;
        const last   = i === STEPS.length - 1;
        return (
          <div key={s.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all",
                  (done || active) ? "text-white" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400",
                  active ? "ring-[3px] ring-violet-400/25 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900/20" : "",
                ].join(" ")}
                style={(done || active) ? { background: GRAD } : undefined}>
                {done && s.id !== currentStep ? <CheckCircle2 size={13} strokeWidth={2.5} /> : s.id}
              </div>
              {!last && (
                <div className="w-px flex-1 mt-1 mb-1 min-h-[20px] bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-full">
                  <motion.div className="w-full rounded-full" style={{ background: GRAD }}
                    initial={{ height: "0%" }}
                    animate={{ height: (done && s.id !== currentStep) ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }} />
                </div>
              )}
            </div>
            <div className={["pb-5 pt-0.5", last ? "" : ""].join(" ")}>
              <p className={[
                "text-[12px] font-semibold leading-tight",
                active ? "text-gray-900 dark:text-white"
                : done  ? "text-gray-500 dark:text-gray-400"
                :         "text-gray-300 dark:text-gray-600",
              ].join(" ")}>{s.label}</p>
              {active && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-[10px] text-violet-500 dark:text-violet-400 mt-0.5">
                  In progress
                </motion.p>
              )}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   PROGRESS SUMMARY  (sidebar bottom)
───────────────────────────────────────────────────────────────────── */
function ProgressSummary({ progress }) {
  const items = [
    { key: 1, label: "PAN Verified"     },
    { key: 2, label: "Aadhaar Verified" },
    { key: 3, label: "Bank Verified"    },
    { key: 4, label: "Company PAN Uploaded" },
  ];
  const done = Object.values(progress).filter(Boolean).length;

  return (
    <div className="mt-auto">
      <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Progress</p>
          <span className="text-[11px] font-bold text-violet-500">{done}/4</span>
        </div>
        <div className="space-y-2 mb-3.5">
          {items.map(it => (
            <div key={it.key} className="flex items-center gap-2">
              <div className={[
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                progress[it.key] ? "text-white" : "bg-gray-100 dark:bg-gray-800",
              ].join(" ")}
                style={progress[it.key] ? { background: GRAD } : undefined}>
                {progress[it.key]
                  ? <CheckCircle2 size={9} strokeWidth={3} />
                  : <div className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />}
              </div>
              <span className={[
                "text-[11px] font-medium",
                progress[it.key] ? "text-gray-700 dark:text-gray-300" : "text-gray-300 dark:text-gray-600",
              ].join(" ")}>{it.label}</span>
            </div>
          ))}
        </div>
        <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: GRAD }}
            animate={{ width: `${(done / 4) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   HORIZONTAL STEPPER  (mobile)
───────────────────────────────────────────────────────────────────── */
function HorizontalStepper({ currentStep, progress }) {
  return (
    <div className="flex items-center pt-2">
      {STEPS.map((s, i) => {
        const done   = progress[s.id] || s.id < currentStep;
        const active = s.id === currentStep;
        return (
          <div key={s.id} className="flex items-center flex-1 min-w-0">
            <div className={[
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
              (done || active) ? "text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400",
              active ? "ring-2 ring-violet-400/25 ring-offset-1 ring-offset-white dark:ring-offset-gray-950" : "",
            ].join(" ")}
              style={(done || active) ? { background: GRAD } : undefined}>
              {done && s.id !== currentStep ? <CheckCircle2 size={11} /> : s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <motion.div className="h-full rounded-full" style={{ background: GRAD }}
                  initial={{ width: "0%" }}
                  animate={{ width: (done && s.id !== currentStep) ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────────────── */
function KYCFooter({ step, loading, canAdvance, onBack, onNext, onSubmit }) {
  const isFirst  = step === 1;
  const isReview = step === 5;

  return (
    <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-7 sm:px-10 py-4 flex items-center justify-between gap-3 bg-white dark:bg-gray-950">
      {!isFirst ? (
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer focus:outline-none">
          <ChevronLeft size={15} /> Back
        </button>
      ) : <div />}

      {isReview ? (
        <motion.button type="button" onClick={onSubmit} disabled={loading}
          whileHover={!loading ? { scale: 1.02 } : undefined}
          whileTap={!loading ? { scale: 0.97 } : undefined}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer focus:outline-none shadow-md shadow-violet-500/20"
          style={{ background: GRAD }}>
          {loading
            ? <><Spinner /> Submitting…</>
            : <><ShieldCheck size={15} /> Submit KYC</>}
        </motion.button>
      ) : (
        <motion.button type="button" onClick={onNext} disabled={!canAdvance}
          whileHover={canAdvance ? { scale: 1.02 } : undefined}
          whileTap={canAdvance ? { scale: 0.97 } : undefined}
          className="inline-flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none shadow-md shadow-violet-500/15"
          style={{ background: GRAD }}>
          Continue <ChevronRight size={15} />
        </motion.button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 1 — COMPANY PAN VERIFICATION
════════════════════════════════════════════════════════════════════ */
function Step1PAN({ panData, setPanData }) {
  const [pan,   setPan]   = useState(panData?.pan_number ?? "");
  const [phase, setPhase] = useState(panData ? "verified" : "idle");
  const [error, setError] = useState("");

  if (phase === "verified" && panData) {
    return (
      <StepShell title="Company PAN Verification" icon={CreditCard}
        desc="Verified against the Income Tax Department database.">
        <div className="space-y-4">
          <PANCertificate data={panData} />
          <button type="button"
            onClick={() => { setPanData(null); setPhase("idle"); setPan(""); setError(""); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-500 transition cursor-pointer">
            <RefreshCw size={11} /> Re-verify / Edit PAN
          </button>
        </div>
      </StepShell>
    );
  }

  const handleVerify = async () => {
    setError("");
    try {
      setPhase("verifying");
      const data = await verifyPAN(pan);
      setPanData(data);
      setPhase("verified");
    } catch(e) {
      setError(e.message || "Verification failed. Please try again.");
      setPhase("idle");
    }
  };

  return (
    <StepShell title="Company PAN Verification" icon={CreditCard}
      desc="Enter your company's 10-digit PAN number to verify with the Income Tax Department.">
      <AnimatePresence mode="wait">
        {phase === "verifying" ? (
          <motion.div key="vfy" {...fadeUp}>
            <VerifyingCert title="Verifying with Income Tax Department"
              messages={["Validating PAN format…","Checking Income Tax database…","Fetching business details…"]}
              accentColor="#F59E0B" />
          </motion.div>
        ) : (
          <motion.div key="form" {...fadeUp} className="max-w-md space-y-5">
            <Field label="Company PAN Number" required error={error}>
              <div className="flex gap-3">
                <input type="text" placeholder="ABCDE1234F" maxLength={10}
                  value={pan}
                  onChange={e => { setPan(e.target.value.toUpperCase()); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleVerify()}
                  className={`${iCls(!!error)} flex-1 font-mono tracking-[0.2em] uppercase text-[15px]`} />
                <GradBtn onClick={handleVerify} icon={BadgeCheck}>Verify PAN</GradBtn>
              </div>
            </Field>
            <InfoNote>PAN is required for tax compliance. Encrypted and stored securely.</InfoNote>
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}

/* ─── PAN Verification Certificate ──────────────────────────────── */
function PANCertificate({ data }) {
  const isActive = data.status?.toLowerCase() === "active";
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <motion.div {...certAnim}
      className="rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 8px 32px rgba(245,158,11,0.14), 0 2px 8px rgba(0,0,0,0.07)",
        border: "1.5px solid rgba(245,158,11,0.35)",
      }}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="relative px-6 pt-4 pb-6"
        style={{
          background: "linear-gradient(135deg, #FFFDF5 0%, #FFF8E0 50%, #FFFDF5 100%)",
          borderBottom: "1px solid rgba(245,158,11,0.2)",
        }}>

        {/* Security micropattern */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(-55deg, transparent 0, transparent 6px, rgba(245,158,11,0.04) 6px, rgba(245,158,11,0.04) 7px)`,
          }} />

        {/* Ashoka Chakra watermark */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none select-none"
          style={{ fontSize: "68px", opacity: 0.045, lineHeight: 1, color: "#92400E" }}>
          ☸
        </div>

        {/* Header content */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Emblem block */}
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl text-[20px]"
              style={{
                background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
                border: "1.5px solid rgba(245,158,11,0.3)",
                boxShadow: "0 2px 6px rgba(245,158,11,0.18)",
              }}>
              🏛️
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-amber-700 mb-0.5">
                Income Tax Department · Government of India
              </p>
              <p className="text-[15px] font-extrabold text-amber-950 leading-tight">
                PAN Verification Certificate
              </p>
              <p className="text-[9px] text-amber-700/70 font-medium mt-0.5 leading-snug">
                Permanent Account Number · Ministry of Finance
              </p>
            </div>
          </div>

          {/* Verification Seal — PAN */}
          <div className="flex flex-col items-center shrink-0 gap-2">
            <div className="relative flex items-center justify-center rounded-full"
              style={{
                width: 62, height: 62,
                background: "radial-gradient(circle at 38% 38%, #ffffff 40%, #D1FAE5 100%)",
                border: "2px solid #10B981",
                boxShadow: "0 3px 12px rgba(16,185,129,0.20)",
              }}>
              <div className="absolute rounded-full pointer-events-none"
                style={{ inset: 4, border: "1px dashed rgba(16,185,129,0.35)" }} />
              <CheckCircle2 size={30} className="text-emerald-600 relative z-10" strokeWidth={2} />
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-emerald-700 leading-none mb-0.5">VERIFIED</p>
              <p className="text-[7.5px] font-medium text-amber-700/65 uppercase tracking-[0.06em] leading-snug">
                Income Tax<br/>Department
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRICOLOR STRIPE ─────────────────────────────────────── */}
      <div className="flex h-[4px]">
        <div className="flex-1" style={{ background: "#FF9933" }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ background: "#138808" }} />
      </div>

      {/* ── BODY ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        <DocRow label="Company Name"       value={data.company_name}    primary />
        <DocRow label="PAN Number"         value={data.pan_number}      mono />
        <DocRow label="Status">
          <span className={`inline-flex items-center gap-2 text-[12px] font-bold ${isActive ? "text-emerald-700" : "text-red-600"}`}>
            <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
            {data.status}
          </span>
        </DocRow>
        {data.business_category  && <DocRow label="Business Category"  value={data.business_category} />}
        {data.registered_address && <DocRow label="Registered Address" value={data.registered_address} />}
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-2"
        style={{
          background: "linear-gradient(135deg, #FFFDF5, #FFF8E0)",
          borderTop: "1px solid rgba(245,158,11,0.18)",
        }}>
        <div className="flex items-center gap-2">
          <Shield size={10} className="text-amber-500 shrink-0" />
          <p className="text-[9px] text-amber-800/60 font-medium">
            Verified via Income Tax Department, Government of India
          </p>
        </div>
        <p className="text-[9px] text-gray-400 font-mono shrink-0">{today}</p>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 2 — AADHAAR VERIFICATION
════════════════════════════════════════════════════════════════════ */
function Step2Aadhaar({ aadhaarData, setAadhaarData }) {
  const [phase,    setPhase]    = useState(aadhaarData ? "verified" : "input");
  const [aadhaar,  setAadhaar]  = useState("");
  const [otp,      setOtp]      = useState("");
  const [clientId, setClientId] = useState(null);
  const [error,    setError]    = useState("");
  const [resend,   setResend]   = useState(0);
  const timer = useRef(null);

  const startTimer = () => {
    setResend(30);
    timer.current = setInterval(
      () => setResend(s => { if (s <= 1) { clearInterval(timer.current); return 0; } return s - 1; }),
      1000
    );
  };

  if (phase === "verified" && aadhaarData) {
    return (
      <StepShell title="Aadhaar Verification" icon={Fingerprint}
        desc="Identity successfully verified via UIDAI OTP authentication.">
        <div className="space-y-4">
          <AadhaarCertificate data={aadhaarData} />
          <button type="button"
            onClick={() => { setAadhaarData(null); setPhase("input"); setOtp(""); setError(""); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-500 transition cursor-pointer">
            <RefreshCw size={11} /> Verify with a different Aadhaar
          </button>
        </div>
      </StepShell>
    );
  }

  const handleSend = async () => {
    setError("");
    try {
      setPhase("sending");
      const res = await sendAadhaarOTP(aadhaar.replace(/\s/g, ""));
      setClientId(res.client_id);
      setPhase("otp");
      startTimer();
    } catch(e) { setError(e.message); setPhase("input"); }
  };

  const handleVerify = async () => {
    setError("");
    try {
      setPhase("verifying");
      const data = await verifyAadhaarOTP(clientId, otp);
      setAadhaarData(data);
      setPhase("verified");
    } 
    catch(e) 
    { setError(e.message); setPhase("otp"); }
  };

  const handleResend = async () => {
    if (resend > 0) return;
    setOtp(""); setError("");
    try {
      setPhase("sending");
      const res = await sendAadhaarOTP(aadhaar.replace(/\s/g, ""));
      setClientId(res.client_id);
      setPhase("otp");
      startTimer();
    } catch(e) { setError(e.message); setPhase("otp"); }
  };

  const isLoading = phase === "sending" || phase === "verifying";

  return (
    <StepShell title="Aadhaar Verification" icon={Fingerprint}
      desc={phase === "otp"
        ? `OTP sent to mobile linked with Aadhaar ending ••••${aadhaar.replace(/\s/g,"").slice(-4)}`
        : "Enter your 12-digit Aadhaar number to receive an OTP on your registered mobile."}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="vfy" {...fadeUp}>
            <VerifyingCert
              title={phase === "sending" ? "Sending OTP via UIDAI" : "Verifying OTP"}
              messages={
                phase === "sending"
                  ? ["Connecting to UIDAI…","Sending OTP to registered mobile…"]
                  : ["Validating OTP…","Fetching Aadhaar details…","Masking sensitive data…"]}
              accentColor="#3B82F6" />
          </motion.div>
        ) : phase === "input" ? (
          <motion.div key="input" {...fadeUp} className="max-w-md space-y-5">
            <Field label="Aadhaar Number" required error={error}>
              <input type="text" placeholder="XXXX XXXX XXXX" maxLength={14}
                value={aadhaar}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
                  setAadhaar(raw.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
                    [a, b, c].filter(Boolean).join(" ")));
                  setError("");
                }}
                className={`${iCls(!!error)} font-mono tracking-[0.2em] text-[15px]`} />
            </Field>
            <GradBtn onClick={handleSend} icon={Phone} full>Send OTP to Registered Mobile</GradBtn>
            <InfoNote>OTP is sent to mobile registered with UIDAI. Aadhaar data is always masked.</InfoNote>
          </motion.div>
        ) : (
          <motion.div key="otp" {...fadeUp} className="max-w-md space-y-5">
            {/* OTP sent banner */}
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 px-4 py-3">
              <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                OTP sent to your registered mobile number.
              </p>
            </div>

            {/* 6-box OTP input */}
            <Field label="Enter 6-digit OTP" required error={error}>
              <OTPInput value={otp} onChange={setOtp} />
            </Field>

            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={() => { setPhase("input"); setOtp(""); setError(""); }}
                className="text-gray-400 hover:text-violet-500 transition cursor-pointer">
                ← Change Aadhaar
              </button>
              <button type="button" onClick={handleResend} disabled={resend > 0}
                className="text-violet-500 disabled:text-gray-400 font-medium cursor-pointer">
                {resend > 0 ? `Resend in ${resend}s` : "Resend OTP"}
              </button>
            </div>
            <GradBtn onClick={handleVerify} disabled={otp.length !== 6} icon={ShieldCheck} full>
              Verify OTP
            </GradBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}

/* ─── Aadhaar Verification Certificate ──────────────────────────── */
function AadhaarCertificate({ data }) {
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <motion.div {...certAnim}
      className="rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 8px 32px rgba(59,130,246,0.13), 0 2px 8px rgba(0,0,0,0.07)",
        border: "1.5px solid rgba(59,130,246,0.3)",
      }}>

      {/* ── LEFT TRICOLOR SIDEBAR + HEADER ──────────────────────── */}
      <div className="flex">
        {/* Vertical tricolor bar */}
        <div className="w-[6px] shrink-0 flex flex-col">
          <div className="flex-1" style={{ background: "#FF9933" }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ background: "#138808" }} />
        </div>

        {/* Header */}
        <div className="flex-1 relative px-6 pt-4 pb-6"
          style={{
            background: "linear-gradient(135deg, #F0F7FF 0%, #DBEAFE 50%, #EFF6FF 100%)",
            borderBottom: "1px solid rgba(59,130,246,0.2)",
          }}>

          {/* Security micropattern */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(60deg, transparent 0, transparent 5px, rgba(59,130,246,0.04) 5px, rgba(59,130,246,0.04) 6px)`,
            }} />

          {/* Fingerprint watermark */}
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none select-none"
            style={{ fontSize: "68px", opacity: 0.045, lineHeight: 1, color: "#1D4ED8" }}>
            ☝
          </div>

          {/* Header content */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #DBEAFE, #BFDBFE)",
                  border: "1.5px solid rgba(59,130,246,0.25)",
                  boxShadow: "0 2px 6px rgba(59,130,246,0.18)",
                }}>
                <Fingerprint size={20} className="text-blue-700" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-800 mb-0.5">
                  UIDAI · Government of India
                </p>
                <p className="text-[15px] font-extrabold text-blue-950 leading-tight">
                  Aadhaar Identity Verification
                </p>
                <p className="text-[9px] text-blue-700/70 font-medium mt-0.5 leading-snug">
                  Unique Identification Authority of India
                </p>
              </div>
            </div>

            {/* Verification Seal — Aadhaar */}
            <div className="flex flex-col items-center shrink-0 gap-2">
              <div className="relative flex items-center justify-center rounded-full"
                style={{
                  width: 62, height: 62,
                  background: "radial-gradient(circle at 38% 38%, #ffffff 40%, #DBEAFE 100%)",
                  border: "2px solid #3B82F6",
                  boxShadow: "0 3px 12px rgba(59,130,246,0.20)",
                }}>
                <div className="absolute rounded-full pointer-events-none"
                  style={{ inset: 4, border: "1px dashed rgba(59,130,246,0.35)" }} />
                <CheckCircle2 size={30} className="text-blue-600 relative z-10" strokeWidth={2} />
              </div>
              <div className="text-center">
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-700 leading-none mb-0.5">OTP VERIFIED</p>
                <p className="text-[7.5px] font-medium text-blue-700/65 uppercase tracking-[0.06em] leading-snug">
                  UIDAI<br/>Verification
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        <DocRow label="Full Name"      value={data.full_name}      primary />
        {data.dob    && <DocRow label="Date of Birth" value={data.dob} />}
        {data.gender && <DocRow label="Gender"        value={data.gender} />}
        <DocRow label="Aadhaar Number" value={data.aadhaar_number} mono />
        {data.address && <DocRow label="Address"      value={data.address} />}
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-2"
        style={{
          background: "linear-gradient(135deg, #F0F7FF, #EFF6FF)",
          borderTop: "1px solid rgba(59,130,246,0.15)",
        }}>
        <div className="flex items-center gap-2">
          <Shield size={10} className="text-blue-400 shrink-0" />
          <p className="text-[9px] text-blue-800/60 font-medium">
            Verified via UIDAI OTP Authentication · Aadhaar is always masked
          </p>
        </div>
        <p className="text-[9px] text-gray-400 font-mono shrink-0">{today}</p>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 3 — BANK ACCOUNT VERIFICATION
════════════════════════════════════════════════════════════════════ */
function Step3Bank({ bankData, setBankData }) {
  const [phase,   setPhase]   = useState(bankData ? "verified" : "idle");
  const [account, setAccount] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ifsc,    setIfsc]    = useState("");
  const [errors,  setErrors]  = useState({});

  if (phase === "verified" && bankData) {
    return (
      <StepShell title="Bank Account Verification" icon={Landmark}
        desc="Bank account verified and ready for payouts and settlements.">
        <div className="space-y-4">
          <BankCertificate data={bankData} />
          <button type="button"
            onClick={() => { setBankData(null); setPhase("idle"); setErrors({}); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-500 transition cursor-pointer">
            <RefreshCw size={11} /> Verify a different account
          </button>
        </div>
      </StepShell>
    );
  }

  const validate = () => {
    const e = {};
    if (!account.trim())          e.account = "Account number is required";
    if (!confirm.trim())          e.confirm  = "Please confirm account number";
    else if (account !== confirm) e.confirm  = "Account numbers do not match";
    if (!ifsc.trim())             e.ifsc     = "IFSC code is required";
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase()))
                                  e.ifsc     = "Invalid IFSC format (e.g. HDFC0001234)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleVerify = async () => {
    if (!validate()) return;
    setErrors({});
    try {
      setPhase("verifying");
      const data = await verifyBank(account.trim(), ifsc.trim().toUpperCase());
      setBankData(data);
      setPhase("verified");
    } catch(e) { setErrors({ _: e.message }); setPhase("idle"); }
  };

  return (
    <StepShell title="Bank Account Verification" icon={Landmark}
      desc="Verify your business bank account for payouts and financial settlements.">
      <AnimatePresence mode="wait">
        {phase === "verifying" ? (
          <motion.div key="vfy" {...fadeUp}>
            <VerifyingCert title="Verifying Bank Account"
              messages={["Validating IFSC code…","Initiating penny-drop verification…","Confirming account details…"]}
              accentColor="#10B981" />
          </motion.div>
        ) : (
          <motion.div key="form" {...fadeUp} className="max-w-md space-y-5">
            <Field label="Account Number" required error={errors.account}>
              <input type="text" placeholder="Enter account number"
                value={account}
                onChange={e => { setAccount(e.target.value.replace(/\D/g,"")); setErrors(p=>({...p,account:undefined})); }}
                className={iCls(!!errors.account)} />
            </Field>
            <Field label="Confirm Account Number" required error={errors.confirm}>
              <input type="text" placeholder="Re-enter account number"
                value={confirm}
                onPaste={e => e.preventDefault()}
                onChange={e => { setConfirm(e.target.value.replace(/\D/g,"")); setErrors(p=>({...p,confirm:undefined})); }}
                className={iCls(!!errors.confirm)} />
            </Field>
            <Field label="IFSC Code" required error={errors.ifsc}>
              <input type="text" placeholder="HDFC0001234" maxLength={11}
                value={ifsc}
                onChange={e => { setIfsc(e.target.value.toUpperCase()); setErrors(p=>({...p,ifsc:undefined})); }}
                className={`${iCls(!!errors.ifsc)} font-mono tracking-widest`} />
            </Field>
            {errors._ && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-4 py-3">
                <XCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{errors._}</p>
              </div>
            )}
            <GradBtn onClick={handleVerify} icon={BadgeCheck} full>Verify Bank Account</GradBtn>
            <InfoNote>Penny-drop verification confirms your account is active. No debit is made.</InfoNote>
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}

/* ─── Bank Verification Certificate ─────────────────────────────── */
function BankCertificate({ data }) {
  const isVerified = data.status?.toLowerCase() === "verified";
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <motion.div {...certAnim}
      className="rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 8px 32px rgba(16,185,129,0.12), 0 2px 8px rgba(0,0,0,0.07)",
        border: "1.5px solid rgba(16,185,129,0.35)",
      }}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="relative px-6 pt-4 pb-6"
        style={{
          background: "linear-gradient(135deg, #F4FDF8 0%, #DCFCE7 50%, #F4FDF8 100%)",
          borderBottom: "1px solid rgba(16,185,129,0.2)",
        }}>

        {/* Security micropattern */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(30deg, transparent 0, transparent 8px, rgba(16,185,129,0.04) 8px, rgba(16,185,129,0.04) 9px)`,
          }} />

        {/* Bank icon watermark */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none select-none"
          style={{ fontSize: "68px", opacity: 0.04, lineHeight: 1, color: "#065F46" }}>
          🏦
        </div>

        {/* Header content */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, #DCFCE7, #A7F3D0)",
                border: "1.5px solid rgba(16,185,129,0.25)",
                boxShadow: "0 2px 6px rgba(16,185,129,0.18)",
              }}>
              <Landmark size={20} className="text-emerald-700" />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-emerald-800 mb-0.5">
                {data.bank_name} · Bank Account Verification
              </p>
              <p className="text-[15px] font-extrabold text-emerald-950 leading-tight">
                Account Verification Certificate
              </p>
              <p className="text-[9px] text-emerald-700/70 font-medium mt-0.5 leading-snug">
                Penny-Drop Verification · RBI Compliant
              </p>
            </div>
          </div>

          {/* Verification Seal — Bank */}
          <div className="flex flex-col items-center shrink-0 gap-2">
            <div className="relative flex items-center justify-center rounded-full"
              style={{
                width: 62, height: 62,
                background: "radial-gradient(circle at 38% 38%, #ffffff 40%, #D1FAE5 100%)",
                border: "2px solid #10B981",
                boxShadow: "0 3px 12px rgba(16,185,129,0.20)",
              }}>
              <div className="absolute rounded-full pointer-events-none"
                style={{ inset: 4, border: "1px dashed rgba(16,185,129,0.35)" }} />
              <CheckCircle2 size={30} className="text-emerald-600 relative z-10" strokeWidth={2} />
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-emerald-700 leading-none mb-0.5">VERIFIED</p>
              <p className="text-[7.5px] font-medium text-emerald-700/65 uppercase tracking-[0.06em] leading-snug">
                Bank Account<br/>Verified
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── GREEN STRIPE ────────────────────────────────────────── */}
      <div className="h-[3px]" style={{ background: "linear-gradient(to right, #10B981, #059669, #10B981)" }} />

      {/* ── BODY ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        <DocRow label="Bank"           value={data.bank_name}      primary />
        <DocRow label="Account Holder" value={data.account_holder} />
        <DocRow label="Account Number" value={data.account_masked} mono />
        <DocRow label="IFSC Code"      value={data.ifsc}           mono />
        <DocRow label="Status">
          <span className={`inline-flex items-center gap-2 text-[12px] font-bold ${isVerified ? "text-emerald-700" : "text-gray-600"}`}>
            <span className={`h-2 w-2 rounded-full ${isVerified ? "bg-emerald-500" : "bg-gray-400"}`} />
            {data.status}
          </span>
        </DocRow>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-2"
        style={{
          background: "linear-gradient(135deg, #F4FDF8, #ECFDF5)",
          borderTop: "1px solid rgba(16,185,129,0.18)",
        }}>
        <div className="flex items-center gap-2">
          <Shield size={10} className="text-emerald-500 shrink-0" />
          <p className="text-[9px] text-emerald-800/60 font-medium">
            Verified via penny-drop · No debit was made to this account
          </p>
        </div>
        <p className="text-[9px] text-gray-400 font-mono shrink-0">{today}</p>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 4 — COMPANY PAN DOCUMENT UPLOAD
════════════════════════════════════════════════════════════════════ */
function Step4Doc({ docData, setDocData, panData }) {
  const [phase, setPhase] = useState(docData ? "done" : "idle");
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    try {
      setPhase("validating");
      setDocData({ file, fileName: file.name, match: null });
      const result = await validateDocument(file, panData?.pan_number);
      setDocData({ file, fileName: file.name, ...result });
      setPhase("done");
    } catch(e) {
      setError(e.message);
      setDocData(null);
      setPhase("idle");
    }
  };

  return (
    <StepShell title="Company PAN Upload" icon={Upload}
      desc="Upload a clear scan or photo of your company PAN card for verification.">
      <AnimatePresence mode="wait">
        {phase === "validating" ? (
          <motion.div key="vfy" {...fadeUp}>
            <VerifyingCert title="Processing Company PAN Document"
              messages={["Analyzing document…","Running format checks…","Preparing for review…"]}
              accentColor="#a44bf3" />
          </motion.div>
        ) : (
          <motion.div key="upload" {...fadeUp} className="space-y-4 max-w-xl">
            {/* Drop zone — compact */}
            <motion.label htmlFor="pan-doc"
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
              onDragOver={e => e.preventDefault()}
              whileHover={{ scale: 1.005 }}
              className={[
                "flex cursor-pointer flex-col items-center justify-center gap-3",
                "rounded-2xl border-2 border-dashed px-6 py-8 transition-all",
                (docData?.file || docData?.fileName)
                  ? "border-violet-300 dark:border-violet-700 bg-violet-50/40 dark:bg-violet-950/10"
                  : error
                  ? "border-red-300 bg-red-50/20"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10 hover:border-violet-300 hover:bg-violet-50/20",
              ].join(" ")}>
              <input id="pan-doc" type="file" className="sr-only"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={e => handleFile(e.target.files?.[0])} />
              {docData?.file || docData?.fileName ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 shrink-0">
                    <FileText size={20} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 max-w-[240px] truncate">
                      {docData.file?.name ?? docData.fileName}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Click to replace</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0">
                    <Upload size={20} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Drop your Company PAN card here
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or PDF · Max 5 MB</p>
                  </div>
                </div>
              )}
            </motion.label>

            {error && <ErrMsg text={error} />}

            {/* Upload confirmation — neutral, no auto-verified claim */}
            {phase === "done" && (docData?.file || docData?.fileName) && (
              <motion.div {...certAnim}
                className="flex items-start gap-3 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/60 dark:bg-blue-950/20 px-4 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <CheckCircle2 size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-0.5">
                    Company PAN document uploaded successfully.
                  </p>
                  <p className="text-[11.5px] text-blue-700/70 dark:text-blue-400/70 leading-snug">
                    This document will be reviewed by the venuebook.in verification team during KYC approval.
                  </p>
                </div>
              </motion.div>
            )}

            <InfoNote>Only your company PAN card document is required. All uploads are encrypted at rest.</InfoNote>
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 5 — REVIEW & SUBMIT
════════════════════════════════════════════════════════════════════ */
function Step5Review({ panData, aadhaarData, bankData, docData }) {
  const checks = [
    { key: 1, label: "Company PAN Verified",   icon: CreditCard,  done: !!panData },
    { key: 2, label: "Aadhaar Verified",        icon: Fingerprint, done: !!aadhaarData },
    { key: 3, label: "Bank Account Verified",   icon: Landmark,    done: !!bankData },
    { key: 4, label: "Company PAN Uploaded",   icon: Upload,      done: !!(docData?.file || docData?.fileName) },
  ];
  const allDone = checks.every(c => c.done);

  return (
    <StepShell title="Review & Submit" icon={ShieldCheck}
      desc="Review all verified details before submitting your KYC for approval.">

      {/* Overall status banner */}
      <div className={[
        "flex items-center gap-3 rounded-xl px-5 py-4 mb-4",
        allDone
          ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30"
          : "border border-gray-100 dark:border-gray-800",
      ].join(" ")}
        style={!allDone ? { background: GRAD_SOFT } : undefined}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: allDone ? "linear-gradient(135deg,#10b981,#059669)" : GRAD }}>
          <ShieldCheck size={17} className="text-white" />
        </div>
        <div>
          <p className={[
            "text-[13.5px] font-bold",
            allDone ? "text-emerald-800 dark:text-emerald-300" : "text-violet-800 dark:text-violet-300",
          ].join(" ")}>
            {allDone ? "Ready For venuebook.in Review" : "Verification in progress"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {checks.filter(c => c.done).length} of 4 verifications completed
          </p>
        </div>
      </div>

      {/* Verification checklist */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
        {checks.map((c, i) => (
          <div key={c.key}
            className={[
              "flex items-center gap-3 px-4 py-3",
              i < checks.length - 1 ? "border-b border-gray-50 dark:border-gray-800/60" : "",
            ].join(" ")}>
            <div className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
              c.done ? "text-white" : "bg-gray-100 dark:bg-gray-800",
            ].join(" ")}
              style={c.done ? { background: GRAD } : undefined}>
              <c.icon size={13} className={c.done ? "text-white" : "text-gray-400 dark:text-gray-500"} />
            </div>
            <span className={[
              "text-[13px] font-medium flex-1",
              c.done ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500",
            ].join(" ")}>
              {c.label}
            </span>
            {c.done ? (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} />
                <span className="text-[11px] font-bold">Complete</span>
              </div>
            ) : (
              <span className="text-[11px] font-medium text-gray-300 dark:text-gray-600">Pending</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
        By submitting you confirm all information is accurate and authorise venuebook.in to verify your
        business identity for compliance purposes.
      </p>
    </StepShell>
  );
}


function SubmittedView({ onClose }) {
  return (
    <div className="flex flex-col items-center py-16 text-center gap-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-24 w-24 items-center justify-center rounded-full"
        style={{ background: GRAD }}>
        <CheckCircle2 size={40} className="text-white" strokeWidth={2} />
        <motion.div className="absolute inset-0 rounded-full" style={{ background: GRAD }}
          initial={{ scale: 1, opacity: 0.35 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.5 }} />
      </motion.div>

      <div className="max-w-sm">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">KYC Submitted!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Our team will review your KYC within{" "}
          <strong className="text-gray-700 dark:text-gray-300">1-2 business days</strong>.
          You will receive an email once your account is verified.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/30 px-5 py-2.5">
        <Clock size={14} className="text-blue-500" />
        <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Under Review</span>
      </div>

      <motion.button type="button" onClick={onClose}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        className="rounded-xl px-8 py-3 text-sm font-semibold text-white cursor-pointer focus:outline-none shadow-lg shadow-violet-500/20"
        style={{ background: GRAD }}>
        Done
      </motion.button>
    </div>
  );
}

/* ================================================================
   SHARED PRIMITIVES
================================================================ */

/** Step content wrapper */
function StepShell({ icon: Icon, title, desc, children }) {
  return (
    <div className="pb-6">
      <div className="flex items-start gap-4 mb-8">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl mt-0.5"
          style={{ background: GRAD_SOFT }}>
          <Icon size={20} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-gray-900 dark:text-white leading-tight">{title}</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 leading-snug max-w-lg">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * DocRow - one row inside a verification certificate document.
 * Two-column layout: tinted label column | value column.
 */
function DocRow({ label, value, children, primary = false, mono = false }) {
  return (
    <div className="flex items-stretch divide-x divide-gray-100 dark:divide-gray-800">
      <div className="flex items-center w-36 shrink-0 px-5 py-2 bg-gray-50/80 dark:bg-gray-800/30">
        <span className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500 leading-tight">
          {label}
        </span>
      </div>
      <div className={[
        "flex-1 px-5 py-2",
        primary ? "text-[13px] font-bold text-gray-900 dark:text-white" : "text-[12px] font-semibold text-gray-700 dark:text-gray-300",
        mono ? "font-mono tracking-[0.1em]" : "",
      ].join(" ")}>
        {children ?? value}
      </div>
    </div>
  );
}

/** 6-digit OTP input with individual boxes */
function OTPInput({ value, onChange }) {
  const [digits, setDigits] = useState(() => {
    const arr = Array(6).fill("");
    if (value) value.split("").forEach((c, i) => { if (i < 6) arr[i] = c; });
    return arr;
  });
  const refs = useRef(Array(6).fill(null));

  useEffect(() => {
    if (!value) setDigits(Array(6).fill(""));
  }, [value]);

  const update = (newDigits) => {
    setDigits(newDigits);
    onChange(newDigits.join(""));
  };

  const handleChange = (idx, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const d = [...digits];
    if (raw.length > 1) {
      const chars = raw.slice(0, 6 - idx).split("");
      chars.forEach((c, i) => { if (idx + i < 6) d[idx + i] = c; });
      update(d);
      refs.current[Math.min(idx + chars.length, 5)]?.focus();
    } else {
      d[idx] = raw.slice(-1);
      update(d);
      if (raw && idx < 5) refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      const d = [...digits];
      if (d[idx]) { d[idx] = ""; update(d); }
      else if (idx > 0) { refs.current[idx - 1]?.focus(); d[idx - 1] = ""; update(d); }
    } else if (e.key === "ArrowLeft"  && idx > 0) refs.current[idx - 1]?.focus();
    else if   (e.key === "ArrowRight" && idx < 5) refs.current[idx + 1]?.focus();
  };

  return (
    <div className="flex gap-2.5">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
          autoFocus={i === 0}
          className={[
            "h-14 w-11 rounded-xl border-2 text-center text-xl font-bold transition-all",
            "bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none",
            d
              ? "border-violet-400 ring-2 ring-violet-400/20 bg-violet-50/40 dark:bg-violet-950/20"
              : "border-gray-200 dark:border-gray-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

/** Animated loading skeleton shown during API verification */
function VerifyingCert({ title, messages, accentColor = "#a44bf3" }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % messages.length), 900);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="h-[3px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <motion.div className="h-full w-2/5 rounded-full"
          style={{ background: accentColor }}
          animate={{ x: ["-100%", "350%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
      </div>
      <div className="flex items-center gap-4 px-7 py-5 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
          <Spinner accentColor={accentColor} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</p>
          <AnimatePresence mode="wait">
            <motion.p key={idx}
              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] text-gray-400 mt-0.5">
              {messages[idx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        {[{ lw: "w-24", vw: "w-2/3" }, { lw: "w-20", vw: "w-1/2" }, { lw: "w-28", vw: "w-3/4" }, { lw: "w-24", vw: "w-1/3" }].map((r, i) => (
          <div key={i} className="flex items-stretch divide-x divide-gray-100 dark:divide-gray-800">
            <div className="w-44 shrink-0 px-7 py-3.5 bg-gray-50/80 dark:bg-gray-800/30">
              <div className={"h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse " + r.lw} />
            </div>
            <div className="flex-1 px-7 py-3.5">
              <div className={"h-3 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse " + r.vw} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoNote({ children }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 px-4 py-3">
      <Shield size={13} className="shrink-0 mt-0.5 text-emerald-500" />
      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{children}</p>
    </div>
  );
}

function Field({ label, required = false, error, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}{required && <span className="text-red-400 ms-0.5">*</span>}
      </label>
      {children}
      {error && <ErrMsg text={error} />}
    </div>
  );
}

function ErrMsg({ text }) {
  return (
    <motion.p initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium">
      <AlertCircle size={12} className="shrink-0" />{text}
    </motion.p>
  );
}

function GradBtn({ onClick, disabled = false, icon: Icon, full = false, children }) {
  return (
    <motion.button type="button" onClick={onClick} disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      className={[
        "shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white",
        "disabled:opacity-50 cursor-pointer focus:outline-none shadow-sm shadow-violet-500/15",
        full ? "w-full" : "",
      ].join(" ")}
      style={{ background: GRAD }}>
      {Icon && <Icon size={15} />}
      {children}
    </motion.button>
  );
}

function Spinner({ accentColor }) {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"
      style={{ color: accentColor ?? "#a44bf3" }}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

const iCls = (hasErr) => [
  "w-full rounded-xl border px-4 py-2.5 text-sm",
  "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
  "placeholder:text-gray-300 dark:placeholder:text-gray-600",
  "outline-none transition-all",
  hasErr
    ? "border-red-300 dark:border-red-700 ring-2 ring-red-400/15"
    : "border-gray-200 dark:border-gray-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-400/20",
].join(" ");
