"use client";


import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal }           from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShieldCheck, CreditCard, Fingerprint, Landmark,
  Upload, CheckCircle2, Clock, ChevronRight, ChevronLeft,
  AlertCircle, RefreshCw, Phone, BadgeCheck, FileText,
  XCircle, Shield, Building2, User,
} from "lucide-react";

import {
  verifyPAN, sendAadhaarOTP, verifyAadhaarOTP,
  verifyBank, validateDocument,
  initializeDigilocker,
  verifyGST,
} from "@/services/kycVerification";

import { currency_icon,formatPrice } from '@/lib/currency_format'

import { SubmitKYC, each_kyc_status } from "@/services/kyc.service";

/* ─── Design tokens ──────────────────────────────────────────────── */
const GRAD      = "linear-gradient(242deg,#a44bf3,#499ce8)";
const GRAD_SOFT = "linear-gradient(242deg,rgba(164,75,243,0.08),rgba(73,156,232,0.08))";

/* NOTE: keys are unchanged ("personal" / "business") on purpose — they are
   still the exact strings sent to verifyPAN() and compared throughout the
   rest of this file. Only the user-facing framing changed: this now maps
   to "GST registered?" (business = yes, personal = no) instead of an
   account-type persona choice. */
const CATEGORY_META = {
  personal: { label: "Not GST Registered", icon: User,      color: "#7C3AED", bg: "#EDE9FE" },
  business: { label: "GST Registered",     icon: Building2, color: "#0369A1", bg: "#E0F2FE" },
};

/* Step labels — used to compute the header's current-step subtitle.
   Step 1 and step 2 labels flex per branch (see stepsForCategory()).
   Documents (id 4) is the last step — there's no id 5, submit happens
   right there, so none of this list should ever imply a step after it. */
const STEPS = [
  { id: 0, label: "GST Status",   icon: Shield       },
  { id: 1, label: "PAN",          icon: CreditCard   },
  { id: 2, label: "Aadhaar / GST", icon: Fingerprint },
  { id: 3, label: "Bank Account", icon: Landmark     },
  { id: 4, label: "Documents",    icon: Upload       },
];

/** Branch-specific step labels — same ids/logic, clearer per-path copy. */
function stepsForCategory(category) {
  return STEPS.map(s => {
    if (s.id === 1) return { ...s, label: category === "business" ? "PAN & GST" : "PAN" };
    if (s.id === 2) return { ...s, label: category === "business" ? "GST" : category === "personal" ? "Aadhaar" : "Aadhaar / GST" };
    return s;
  });
}

/* ─── Motion presets ─────────────────────────────────────────────── */
const BACK_A  = { initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}, transition:{duration:0.2} };
const MODAL_A = {
  initial:{ opacity:0, scale:0.96, y:20 },
  animate:{ opacity:1, scale:1,    y:0  },
  exit:   { opacity:0, scale:0.96, y:20 },
  transition:{ duration:0.3, ease:[0.16,1,0.3,1] },
};
const slide = (d) => ({
  initial:{ opacity:0, x: d * 24 },
  animate:{ opacity:1, x: 0      },
  exit:   { opacity:0, x: d * -24 },
  transition:{ duration:0.24, ease:[0.16,1,0.3,1] },
});
const fadeUp = {
  initial:{ opacity:0, y:12 }, animate:{ opacity:1, y:0 }, exit:{ opacity:0, y:-8 },
  transition:{ duration:0.22, ease:[0.16,1,0.3,1] },
};
const certAnim = {
  initial:{ opacity:0, y:18, scale:0.98 },
  animate:{ opacity:1, y:0,  scale:1    },
  transition:{ duration:0.4, ease:[0.16,1,0.3,1] },
};

/* ════════════════════════════════════════════════════════════════════
   BACKEND-DRIVEN STEP RESOLUTION
   Backend is the single source of truth for how far a user has
   progressed. No localStorage is used to persist/resume steps.
════════════════════════════════════════════════════════════════════ */

/** Helper — treats any of these backend values as "approved" */
function isApproved(status) {
  const v = (status || "").toString().toLowerCase();
  return v === "approved" || v === "verified" || v === "active";
}

/**
 * calculateActiveStep
 * Given the latest KYC status payload from the backend (shape:
 * { pan: {status}, aadhaar: {status}, gst: {status}, bank: {status}, doc: {status} })
 * plus the locally-chosen account category (category is a UI-only choice,
 * the backend has no concept of it until PAN is submitted), work out
 * which step the wizard should resume on.
 */
function calculateActiveStep(status, category, docUploaded) {
  if (!status) return category ? 1 : 0;

  const panApproved = isApproved(status?.pan?.status ?? status?.pan?.verification_status);
  if (!panApproved) return category ? 1 : 0;

  if (!category) return 1; // PAN approved but we still don't know the account type

  if (category === "business") {
    const gstApproved = isApproved(status?.gst?.status ?? status?.gst?.verification_status) || !!status?.gst?.document_number;
    if (!gstApproved) return 2;
  } else {
    const aadhaarApproved = isApproved(status?.aadhaar?.status ?? status?.aadhaar?.verification_status) || !!status?.aadhaar?.doc_details;
    if (!aadhaarApproved) return 2;
  }

  const bankApproved = isApproved(status?.bank?.status ?? status?.bank?.verification_status);
  if (!bankApproved) return 3;

  if (!docUploaded) return 4;

  return 4; // everything done — Documents is the last step, ready to submit
}

/* ════════════════════════════════════════════════════════════════════
   ROOT MODAL COMPONENT
════════════════════════════════════════════════════════════════════ */
export default function KYCModal({ open, setOpen , kycData ,kycStatus}) {
  const [step,      setStep]      = useState(0);
  const [dir,       setDir]       = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [category,    setCategory]    = useState(null);
  const [panData,     setPanData]     = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [bankData,    setBankData]    = useState(null);
  const [docData,     setDocData]     = useState(null);

  /* Latest raw status payload from the backend — source of truth for
     which step the wizard resumes on. Never persisted client-side. */
  const [liveStatus, setLiveStatus] = useState(null);

  /* Set when the DigiLocker tab reports DIGILOCKER_FAILURE, so
     Step2Aadhaar can show a real error instead of silently sitting on
     the "awaiting" card forever. Cleared whenever a fresh DigiLocker
     attempt starts. */
  const [digilockerError, setDigilockerError] = useState("");

  const digilockerPopupRef = useRef(null);

  /* ── Apply a KYC status/data payload coming from the backend ────── */
  const applyKycPayload = useCallback((data, statusMeta) => {
    if (!data) return;

    try {
      // ---------------- PAN ----------------
      if (data.pan) {
        const panDetails =
          typeof data.pan.doc_details === "string"
            ? JSON.parse(data.pan.doc_details)
            : data.pan.doc_details;

        const gstDetails = data.gst
          ? typeof data.gst.doc_details === "string"
            ? JSON.parse(data.gst.doc_details)
            : data.gst.doc_details
          : null;

        const gstNumber =
          data.gst?.document_number ||
          gstDetails?.gstin_list?.[0]?.gstin ||
          "";

        setPanData({
          pan_number: data.pan.document_number,
          company_name: panDetails?.full_name,
          business_category: panDetails?.category,
          registered_address: panDetails?.address?.full,
          status: panDetails?.status,
          verification_status: data.pan.verification_status,
          fromBackend: true,
        });

        setDocData(prev => ({
          ...prev,
          company_name: panDetails?.full_name,
          pan_number: data.pan.document_number,
          business_category: panDetails?.category,
          registered_address: panDetails?.address?.full,
          gst_number: gstNumber,
          gst_details: gstDetails,
          gstVerified: prev?.gstVerified || !!gstNumber,
          fileName: data.pan.file_url?.split("/").pop() || prev?.fileName || "",
        }));
      }

      // ---------------- Aadhaar ----------------
      if (data.aadhaar?.doc_details) {
        // Parse doc_details if string
        const doc =
          typeof data.aadhaar.doc_details === "string"
            ? JSON.parse(data.aadhaar.doc_details)
            : data.aadhaar.doc_details;

        const metadata = doc?.data?.digilocker_metadata || {};
        const aadhaar = doc?.data?.aadhaar_xml_data || {};

        setAadhaarData({
          full_name: aadhaar.full_name || metadata.name || "",
          dob: aadhaar.dob || metadata.dob || "",
          gender: aadhaar.gender || metadata.gender || "",
          address: aadhaar.full_address || "",
          aadhaar_number: aadhaar.masked_aadhaar || "",
          mobile: metadata.mobile_number || "",
          profile_image: aadhaar.profile_image || "",
          xml_url: doc?.data?.xml_url || "",
          fromBackend: true,
        });
      }

      // ---------------- Bank ----------------
      if (data.bank) {
        setBankData({
          account_holder: data.bank.business_name,
          bank_name: data.bank.bank_name,
          branch: data.bank.branch_name,
          account_masked:
            "XXXX XXXX " +
            (data.bank.account_number?.slice(-4) || ""),
          ifsc: data.bank.ifsc,
          account_number: data.bank.account_number,
          account_type: data.bank.account_type,
          verification_status: data.bank.verification_status,
          status: data.bank.verification_status,
          fromBackend: true,
        });
      }
    } catch (err) {
      console.error("KYC Parse Error:", err);
    }
  }, []);

  /* ── Fetch the latest KYC status from the backend ───────────────── */
  const fetchKycStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const res = await each_kyc_status();
      const data = res?.data ?? res;
      setLiveStatus(data);
      applyKycPayload(data);

      const docUploaded = !!(docData?.file || docData?.fileName || data?.pan?.file_url);
      const nextStep = calculateActiveStep(data, category, docUploaded);
      setStep(nextStep);
      return data;
    } catch (err) {
      console.error("[fetchKycStatus]", err);
      return null;
    } finally {
      setStatusLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyKycPayload, category]);

  /* ── On open: resolve the correct step from the backend ──────────
     Backend is the source of truth — no localStorage is used here. */
  useEffect(() => {
    if (!open) return;

    // A fresh / not-yet-started application starts clean at category select.
    if (kycStatus?.kyc_status === "pending" && !kycData) {
      setCategory(null);
      setPanData(null);
      setAadhaarData(null);
      setBankData(null);
      setDocData(null);
      setLiveStatus(null);
      setStep(0);
      return;
    }

    setSubmitted(kycStatus?.kyc_status === "submitted" || kycStatus?.kyc_status === "under_review");

    if (kycData) {
      applyKycPayload(kycData, kycStatus);
      setLiveStatus(kycData);
    }

    // Always re-confirm against the backend on load/refresh instead of
    // trusting any client-cached step.
    fetchKycStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kycData, kycStatus]);

  /* ── Listen for the DigiLocker popup/tab callback ─────────────────
     The DigiLocker callback page does:
       window.opener.postMessage({ type: "DIGILOCKER_SUCCESS" }, "*")
     We never open DigiLocker ourselves except from the explicit
     "Verify Aadhaar" button click (see Step2Aadhaar).

     This is the ONLY message listener for DIGILOCKER_SUCCESS in the
     component — a second, dead-code listener used to live at the
     bottom of this file that only logged the event and never closed
     the tab or refreshed the Aadhaar data. It has been removed so
     there's a single source of truth for "what happens on success". */
  useEffect(() => {
    async function handleMessage(event) {
      const type = event?.data?.type;
      if (type !== "DIGILOCKER_SUCCESS" && type !== "DIGILOCKER_FAILURE") return;

      // Auto-close the DigiLocker tab/popup as soon as we hear back,
      // success or failure.
      if (digilockerPopupRef.current && !digilockerPopupRef.current.closed) {
        digilockerPopupRef.current.close();
      }
      digilockerPopupRef.current = null;

      if (type === "DIGILOCKER_FAILURE") {
        setDigilockerError(event?.data?.data?.message || "DigiLocker verification failed. Please try again.");
        return;
      }

      setDigilockerError("");
      // Refresh status from backend so Aadhaar data / step actually updates.
      await fetchKycStatus();
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKycStatus]);

  /* ── Guard: step ≥1 requires category ──────────────────────────── */
  useEffect(() => {
    if (!open) return;
    if (step >= 1 && !category) setStep(0);
  }, [open, step, category]);

  /* ── Progress map ───────────────────────────────────────────────── */
  const progress = {
    0: !!category,
    1: !!panData,
    2: category === "personal" ? !!aadhaarData : !!docData?.gstVerified,
    3: !!bankData,
    4: !!(docData?.file || docData?.fileName),
  };

  const canAdvance = useCallback(() => {
    if (step === 0) return !!category;
    if (step === 1) return !!panData;
    if (step === 2) return category === "personal" ? !!aadhaarData : !!docData?.gstVerified;
    if (step === 3) return !!bankData;
    if (step === 4) return !!(docData?.file || docData?.fileName);
    return true;
  }, [step, category, panData, aadhaarData, bankData, docData]);

  const goNext = () => {
    if (!canAdvance()) return;

    setDir(1);

    if (
      step === 1 &&
      category === "business" &&
      docData?.gstVerified
    ) {
      setStep(3); // Skip GST step
      return;
    }

    setStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => {
    setDir(-1);
    setStep(s => Math.max(s - 1, 0));
  };

  /* Step 0 Back = close modal */
  const handleBackOrClose = () => {
    if (step === 0) {
      handleClose();
    } else {
      goBack();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      if (docData?.file instanceof File) fd.append("panFile",  docData.file);
      if (panData?.pan_number)           fd.append("pan",       panData.pan_number);
      if (bankData?.account_masked)      fd.append("accountNo", bankData.account_masked);
      if (bankData?.ifsc)                fd.append("ifsc",      bankData.ifsc);
      await SubmitKYC(fd);
      setSubmitted(true);
      // Re-sync with backend so a future refresh resumes correctly.
      fetchKycStatus();
    } catch(e) { console.error("[KYCModal]", e); }
    finally    { setLoading(false); }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setLoading(false);
    }, 320);
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">

          {/* Backdrop — locked, no dismiss */}
          <motion.div {...BACK_A}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

          {/* Modal shell */}
          <motion.div {...MODAL_A}
            onClick={e => e.stopPropagation()}
            className={[
              "relative z-10 w-full sm:max-w-[640px]",
              "bg-white dark:bg-gray-950",
              "rounded-t-3xl sm:rounded-2xl overflow-hidden",
              "border-0 sm:border sm:border-gray-200/70 dark:sm:border-gray-800",
              "shadow-2xl shadow-black/20 dark:shadow-black/60",
              "flex flex-col",
              "h-[96svh] sm:h-[700px] max-h-[96svh] sm:max-h-[92vh]",
            ].join(" ")}>

            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="h-1.5 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Header */}
            <KYCHeader
              submitted={submitted}
              step={step}
              category={category}
              progress={progress}
              onClose={handleClose}
            />

            {/* Body — just the step content. No side panel: the progress
                bar in the header is the only status signal now. */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="px-5 sm:px-7 pt-5 pb-5">
                  <AnimatePresence mode="wait" initial={false}>
                    {submitted ? (
                      <motion.div key="done" {...slide(1)}>
                        <SubmittedView onClose={handleClose} />
                      </motion.div>
                    ) : (
                      <motion.div key={step} {...slide(dir)}>
                        {step === 0 && (
                          <Step0Category category={category} setCategory={setCategory} />
                        )}
                        {step === 1 && (
                          <Step1PAN
                            panData={panData}
                            docData={docData}
                            setPanData={setPanData}
                            setDocData={setDocData}
                            category={category}
                          />
                        )}
                        {step === 2 && (
                          category === "personal"
                            ? <Step2Aadhaar
                                aadhaarData={aadhaarData}
                                setAadhaarData={setAadhaarData}
                                onVerified={fetchKycStatus}
                                popupRef={digilockerPopupRef}
                                externalError={digilockerError}
                                clearExternalError={() => setDigilockerError("")}
                              />
                            : <Step2GST docData={docData} setDocData={setDocData} />
                        )}
                        {step === 3 && (
                          <Step3Bank bankData={bankData} setBankData={setBankData} onVerified={fetchKycStatus} />
                        )}
                        {step === 4 && (
                          <Step4Doc docData={docData} setDocData={setDocData} panData={panData} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Footer */}
            {!submitted && (
              <KYCFooter
                step={step}
                loading={loading}
                canAdvance={canAdvance()}
                onBack={handleBackOrClose}
                onNext={goNext}
                onSubmit={handleSubmit}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ─────────────────────────────────────────────────────────────────────
   HEADER — shows country + category badge
───────────────────────────────────────────────────────────────────── */
function KYCHeader({ submitted, step, category, progress, onClose }) {
  const catMeta = category ? CATEGORY_META[category] : null;
  const currentLabel = stepsForCategory(category).find(s => s.id === step)?.label;

  /* Thin progress bar replaces the old sidebar/mobile steppers entirely —
     one lightweight, always-accurate signal (based on the same `progress`
     map the rest of the modal already uses) instead of a full step list. */
  const doneCount  = Object.values(progress || {}).filter(Boolean).length;
  const totalCount = Object.keys(progress || {}).length || 1;
  const pct = submitted ? 100 : Math.round((doneCount / totalCount) * 100);

  return (
    <div className="shrink-0 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/30">
      <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Shield icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm"
            style={{ background: GRAD, boxShadow: "0 4px 14px rgba(164,75,243,0.28)" }}>
            <ShieldCheck size={17} className="text-white" />
          </div>

          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
              {submitted ? "Verification submitted" : "KYC verification"}
            </h2>

            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11.5px] text-gray-400 dark:text-gray-500 leading-none truncate">
                {submitted
                  ? "Documents are under review · 1–2 business days"
                  : currentLabel
                  ? `${currentLabel} · 256-bit encrypted`
                  : "256-bit encrypted"}
              </p>

              {/* Category pill — shown once chosen. No country badge here
                  by design: PAN/GST/Aadhaar already make the region obvious. */}
              {catMeta && !submitted && (
                <motion.span
                  initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
                  className="hidden sm:inline-flex shrink-0 items-center text-[9px] font-black
                    uppercase tracking-wide px-1.5 py-[2px] rounded-full leading-none"
                  style={{ background: catMeta.bg, color: catMeta.color }}>
                  {catMeta.label}
                </motion.span>
              )}
            </div>
          </div>
        </div>

        <button type="button" onClick={onClose} aria-label="Close KYC modal"
          className="flex h-8 w-8 items-center justify-center rounded-full
            text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-600
            hover:shadow-sm transition cursor-pointer focus:outline-none shrink-0">
          <X size={15} />
        </button>
      </div>

      {!submitted && (
        <div className="px-5 sm:px-7 pb-3.5">
          <div className="h-[5px] rounded-full bg-gray-200/70 dark:bg-gray-800 overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ background: GRAD }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   FOOTER — back on ALL steps; step 0 back = cancel
───────────────────────────────────────────────────────────────────── */
function KYCFooter({ step, loading, canAdvance, onBack, onNext, onSubmit }) {
  /* Documents (step 4) is now the last step — the old separate Review
     screen just re-listed checkmarks the user had already seen once per
     step, so it's gone. Submit lives directly on Documents instead, and
     stays disabled until the upload actually completes. */
  const isFinalStep = step === 4;
  const backLabel = step === 0 ? "Cancel" : "Back";

  return (
    <div className="shrink-0 border-t border-gray-100 dark:border-gray-800
      px-5 sm:px-7 py-4 flex items-center justify-between gap-3
      bg-white dark:bg-gray-950">

      {/* Back / Cancel — always visible */}
      <button type="button" onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200
          dark:border-gray-700 px-4 py-2.5 text-sm font-medium
          text-gray-600 dark:text-gray-300
          hover:bg-gray-50 dark:hover:bg-gray-800/50
          transition cursor-pointer focus:outline-none">
        <ChevronLeft size={15} /> {backLabel}
      </button>

      {isFinalStep ? (
        <motion.button type="button" onClick={onSubmit} disabled={loading || !canAdvance}
          whileHover={(!loading && canAdvance) ? { scale:1.02 } : undefined}
          whileTap={(!loading && canAdvance) ? { scale:0.97 } : undefined}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5
            text-sm font-semibold text-white
            disabled:opacity-40 disabled:cursor-not-allowed
            cursor-pointer focus:outline-none shadow-md shadow-violet-500/20"
          style={{ background: GRAD }}>
          {loading
            ? <><Spinner /> Submitting…</>
            : <><ShieldCheck size={15} /> Submit KYC</>}
        </motion.button>
      ) : (
        <motion.button type="button" onClick={onNext} disabled={!canAdvance}
          whileHover={canAdvance ? { scale:1.02 } : undefined}
          whileTap={canAdvance ? { scale:0.97 } : undefined}
          className="inline-flex items-center gap-1.5 rounded-xl px-6 py-2.5
            text-sm font-semibold text-white
            disabled:opacity-40 disabled:cursor-not-allowed
            cursor-pointer focus:outline-none shadow-md shadow-violet-500/15"
          style={{ background: GRAD }}>
          Continue <ChevronRight size={15} />
        </motion.button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 0 — CATEGORY SELECTION
════════════════════════════════════════════════════════════════════ */
/* GST_QUESTION_OPTIONS keys map straight onto the existing "category"
   state ("business" / "personal") so verifyPAN(), calculateActiveStep(),
   goNext()'s GST-skip, and every other downstream check keep working
   exactly as before — only the question asked to get there changed.
   The card styling below intentionally reuses the same gradient-band +
   icon-badge + accent-stripe language as PANCertificate / GSTCertificate
   further down this file, so a selectable "card" here actually looks
   like the certificate cards the rest of the flow already uses. */
const GST_QUESTION_OPTIONS = [
  {
    key: "business",
    icon: Building2,
    eyebrow: "Yes",
    title: "GST Registered",
    sub: "We verify your PAN and GSTIN together.",
    accent: "#0EA5E9",
    grad: "linear-gradient(135deg,#F0F9FF 0%,#E0F2FE 60%,#F0F9FF 100%)",
    badgeGrad: "linear-gradient(135deg,#E0F2FE,#BAE6FD)",
    stripe: "linear-gradient(to right,#0EA5E9,#0284C7,#0EA5E9)",
  },
  {
    key: "personal",
    icon: User,
    eyebrow: "No",
    title: "Not GST Registered",
    sub: "We verify your PAN, Aadhaar and bank details.",
    accent: "#7C3AED",
    grad: "linear-gradient(135deg,#FAF5FF 0%,#EDE9FE 60%,#FAF5FF 100%)",
    badgeGrad: "linear-gradient(135deg,#EDE9FE,#DDD6FE)",
    stripe: "linear-gradient(to right,#8B5CF6,#7C3AED,#8B5CF6)",
  },
];

function Step0Category({ category, setCategory }) {
  return (
    <StepShell icon={Shield} title="Is your listing GST registered?"
      desc="This tells us exactly which documents to ask for next.">
      <div className="w-full space-y-4">
        {GST_QUESTION_OPTIONS.map(opt => {
          const selected = category === opt.key;
          return (
            <motion.button key={opt.key} type="button" onClick={() => setCategory(opt.key)}
              aria-pressed={selected}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}
              className={[
                "relative w-full rounded-2xl overflow-hidden text-left transition-shadow duration-200",
                selected ? "ring-2" : "ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-gray-300 dark:hover:ring-gray-600",
              ].join(" ")}
              style={selected
                ? { boxShadow: `0 8px 28px ${opt.accent}26, 0 2px 8px rgba(0,0,0,0.06)`, "--tw-ring-color": opt.accent }
                : undefined}>

              <div className="relative px-5 pt-4 pb-4" style={{ background: opt.grad }}>
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: opt.badgeGrad, border: `1.5px solid ${opt.accent}33`, boxShadow: `0 2px 6px ${opt.accent}22` }}>
                    <opt.icon size={20} style={{ color: opt.accent }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.18em] mb-0.5" style={{ color: opt.accent }}>
                      {opt.eyebrow}
                    </p>
                    <p className="text-[15px] font-extrabold text-gray-900 dark:text-white leading-tight">
                      {opt.title}
                    </p>
                    <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                      {opt.sub}
                    </p>
                  </div>

                  {selected ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ background: opt.accent }}>
                      <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <div className="h-6 w-6 shrink-0 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  )}
                </div>
              </div>

              <div className="h-[3px]" style={{ background: opt.stripe }} />
            </motion.button>
          );
        })}

        <InfoNote>
          GST status can be updated later via support if your registration changes.
          KYC verification is required for all venuebook.in venue partners.
        </InfoNote>
      </div>
    </StepShell>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 1 — PAN VERIFICATION
════════════════════════════════════════════════════════════════════ */
function Step1PAN({ panData,docData, setPanData ,setDocData, category}) {
  const [pan,   setPan]   = useState(panData?.pan_number ?? "");
  const [phase, setPhase] = useState(panData ? "verified" : "idle");
  const [error, setError] = useState("");

  const isBusiness = category === "business";
  const gstShown = isBusiness && docData?.gstVerified ? docData?.gst_number : null;

  if (phase === "verified" && panData) {
    return (
      <StepShell title={isBusiness ? "PAN & GST verification" : "PAN verification"} icon={CreditCard}
        desc={gstShown
          ? "Verified against the Income Tax Department and GSTN databases."
          : "Verified against the Income Tax Department database."}>
        <div className="space-y-4">
          <PANCertificate data={panData} gstNumber={gstShown} />
          <button type="button"
            onClick={() => { setPanData(null); setPhase("idle"); setPan(""); setError(""); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-500 transition cursor-pointer">
            <RefreshCw size={11} /> Re-verify / change PAN
          </button>
        </div>
      </StepShell>
    );
  }

const handleVerify = async () => {
  const val = pan.trim().toUpperCase();

  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val)) {
    setError("Enter a valid 10-character PAN (e.g. ABCDE1234F)");
    return;
  }

  if (!category) {
    setError("Category is missing.");
    return;
  }

  setError("");

  try {
    setPhase("verifying");

    const param = {
      category,
      pan: val,
    };

    const data = await verifyPAN(param);

    setPanData(data);
    setPhase("verified");

    if (category === "business" && data?.gst_number) {
      setDocData(prev => ({
        ...prev,
        gstVerified: 'verified',
        gst_number: data.gst_number,
        company_name: data.company_name,
        pan_number: data.pan_number,
        business_category: data.business_category,
        registered_address: data.registered_address,
        gst_details: data.gst_details,
      }));
    }
  } catch (e) {
    console.error(e);
    setError(e?.message || "Verification failed. Please try again.");
    setPhase("idle");
  }
};
  return (
    <StepShell title={isBusiness ? "PAN & GST verification" : "PAN verification"} icon={CreditCard}
      desc={isBusiness
        ? "Enter your company's 10-digit PAN — we'll verify it and pull your GST registration together."
        : "Enter your 10-digit PAN to verify with the Income Tax Department of India."}>
      <AnimatePresence mode="wait">
        {phase === "verifying" ? (
          <motion.div key="vfy" {...fadeUp}>
            <VerifyingCert title="Verifying with Income Tax Department"
              messages={["Validating PAN format…","Querying Income Tax database…","Fetching business details…"]}
              accentColor="#F59E0B" />
          </motion.div>
        ) : (
          <motion.div key="form" {...fadeUp} className="max-w-md space-y-5">
            <Field label="PAN number" required error={error}>
              <div className="flex gap-3">
                <input type="text" placeholder="ABCDE1234F" maxLength={10}
                  value={pan}
                  onChange={e => { setPan(e.target.value.toUpperCase()); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleVerify()}
                  className={`${iCls(!!error)} flex-1 font-mono tracking-[0.22em] uppercase text-[15px]`} />
                <GradBtn onClick={handleVerify} icon={BadgeCheck}
                  disabled={pan.trim().length !== 10}>
                  Verify
                </GradBtn>
              </div>
            </Field>
            <InfoNote>
              🇮🇳 PAN is required for tax compliance under Indian law. Encrypted at rest.
            </InfoNote>
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}

/* ─── PAN Certificate ────────────────────────────────────────────── */
/* PANCertificate/AadhaarCertificate/GSTCertificate/BankCertificate are
   exported (in addition to being used internally by this modal's own
   steps) so vendor/account/components/sections/KYCHubSection.jsx can
   render the same gradient ID-card UI outside the wizard, fed either
   real each_kyc_status() data or a static fallback when that data isn't
   available yet — see that file's own comment for details. */
export function PANCertificate({ data, gstNumber }) {
  /* Display-only widening — the API returns "valid" for a good PAN, not
     just "active", and this "tag" is purely cosmetic (never feeds the
     backend-driven step resolution in calculateActiveStep). Without this
     a valid PAN showed as a bare, un-flagged status here. */
  const isActive = ["active", "valid", "verified"].includes((data.status || "").toLowerCase());
  const today = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

  return (
    <motion.div {...certAnim}>
      <IdCardFace
        grad="linear-gradient(135deg,#B45309 0%,#D97706 45%,#92400E 100%)"
        textColor="#FFFBEB"
        chipGrad="linear-gradient(135deg,#FDE68A,#F59E0B)"
        boxShadow="0 8px 32px rgba(245,158,11,0.16), 0 2px 8px rgba(0,0,0,0.07)"
        border="1.5px solid rgba(245,158,11,0.35)"
        eyebrow="Income Tax Department · Govt. of India"
        issuer="Permanent Account Number"
        numberLabel="PAN Number"
        number={data.pan_number}
        holderLabel="Company Name"
        holder={data.company_name}
        tag={isActive ? "Verified" : data.status}
        fields={[
          ...(data.business_category  ? [{ label: "Business category",  value: data.business_category }]  : []),
          ...(gstNumber                ? [{ label: "GSTIN",              value: gstNumber }]                : []),
          ...(data.registered_address ? [{ label: "Registered address", value: data.registered_address, wide: true }] : []),
        ]}
        footer={{ label: "Verified via Income Tax Department, Government of India", date: today }}
      />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 2A — AADHAAR VERIFICATION
   DigiLocker is opened ONLY when the user clicks "Verify Aadhaar" /
   "Continue with DigiLocker" below — never automatically, never on
   mount, never on refresh.
════════════════════════════════════════════════════════════════════ */
function Step2Aadhaar({ aadhaarData, setAadhaarData, onVerified, popupRef, externalError, clearExternalError }) {
  const [phase, setPhase] = useState(
    aadhaarData && aadhaarData !== "verified" ? "verified" : "input"
  );
  const [error, setError] = useState("");

  /* IMPORTANT FIX: the line above only sets the *initial* phase, once,
     on mount. When the DigiLocker success message comes back and the
     parent modal re-fetches status, `aadhaarData` changes from null to
     a real object — but without this effect the local `phase` state
     never notices, so the screen stayed stuck showing the "Continue
     with DigiLocker" / "awaiting" card even though verification had
     actually succeeded. This effect keeps `phase` in sync with the
     prop whenever it changes, not just at mount. */
  useEffect(() => {
    if (aadhaarData && aadhaarData !== "verified") {
      setPhase("verified");
      setError("");
    }
  }, [aadhaarData]);

  /* Surfaces DIGILOCKER_FAILURE messages from the callback tab (see
     KYCModal's root message listener). Without this, a failed
     DigiLocker attempt left the UI stuck on the "awaiting" card with
     no feedback, since nothing here ever heard about the failure. */
  useEffect(() => {
    if (!externalError) return;
    setPhase("input");
    setError(externalError);
    clearExternalError?.();
  }, [externalError, clearExternalError]);

  /* Poll while the popup/tab is open so we notice completion even if
     the callback page can't reach window.opener for some reason (e.g.
     the user manually closes the tab after finishing). */
  useEffect(() => {
    if (phase !== "awaiting") return;
    const poll = setInterval(async () => {
      if (popupRef?.current && popupRef.current.closed) {
        clearInterval(poll);
        popupRef.current = null;
        // Tab closed — re-check status in case it succeeded.
        if (onVerified) await onVerified();
      }
    }, 1000);
    return () => clearInterval(poll);
  }, [phase, popupRef, onVerified]);

  const handleDigilockerVerify = async () => {
    setError("");

    try {
      const res = await initializeDigilocker();
      const url = res?.data?.data?.url;

      if (!url) {
        setError("Unable to initialize DigiLocker.");
        return;
      }

      // Opens a new tab, keeping window.opener intact (no "noopener"),
      // which is required for the callback page's postMessage() to
      // reach this window and for popupRef.current.close() to work.
      const newTab = window.open(url, "_blank");

      if (!newTab) {
        setError("Please allow popups for this site.");
        return;
      }

      popupRef.current = newTab;
      setPhase("awaiting");

    } catch (e) {
      setError(e?.message || "Something went wrong.");
    }
  };

  if (phase === "verified" && aadhaarData && aadhaarData !== "verified") {
    return (
      <StepShell title="Aadhaar verification" icon={Fingerprint}
        desc="Identity verified via UIDAI DigiLocker.">
        <div className="space-y-4">
          <AadhaarCertificate data={aadhaarData} />
          <button type="button"
            onClick={() => { setAadhaarData(null); setPhase("input"); setError(""); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-500 transition cursor-pointer">
            <RefreshCw size={11} /> Verify with a different Aadhaar
          </button>
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell title="Aadhaar verification" icon={Fingerprint}
      desc="Securely verify your identity using DigiLocker — the official government document wallet.">
      <div className="w-full space-y-5">

        {/* DigiLocker card */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800"
          style={{ background:"linear-gradient(135deg,#EFF6FF,#F0F7FF)" }}>
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100 blur-3xl opacity-60" />

          <div className="relative p-5">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40">
                <ShieldCheck size={26} className="text-blue-600" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50
                  px-3 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 mb-2">
                  <BadgeCheck size={11} /> Government recommended
                </span>
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                  Verify via DigiLocker
                </h3>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Instantly fetch your Aadhaar from the official DigiLocker platform.
                  No manual entry. No OTP needed.
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon:"🔒", label:"End-to-end encrypted" },
                { icon:"🇮🇳", label:"UIDAI approved" },
                { icon:"⚡", label:"Instant verification" },
              ].map(b => (
                <div key={b.label} className="flex flex-col items-center gap-1 rounded-xl
                  bg-white/70 dark:bg-gray-900/40 border border-blue-100 dark:border-blue-900/40 px-2 py-2.5 text-center">
                  <span className="text-[16px]">{b.icon}</span>
                  <span className="text-[9px] font-semibold text-blue-700 dark:text-blue-300 leading-tight">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>

            {phase === "awaiting" ? (
              <motion.div {...fadeUp}
                className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <Clock size={16} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-amber-800">DigiLocker tab opened</p>
                  <p className="text-[11px] text-amber-700/70">
                    Complete verification in the new tab. This screen will update automatically.
                  </p>
                </div>
              </motion.div>
            ) : (
              <GradBtn onClick={handleDigilockerVerify} icon={ShieldCheck} full>
                Continue with DigiLocker
              </GradBtn>
            )}

            {error && <div className="mt-3"><ErrMsg text={error} /></div>}
          </div>
        </div>

        <InfoNote>
          Your Aadhaar number is never stored in plain text.
          Only the last 4 digits are retained after verification.
        </InfoNote>
      </div>
    </StepShell>
  );
}

/* ─── Aadhaar Certificate ────────────────────────────────────────── */
export function AadhaarCertificate({ data }) {
  const today = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

  return (
    <motion.div {...certAnim}>
      <IdCardFace
        grad="linear-gradient(135deg,#1D4ED8 0%,#2563EB 45%,#1E3A8A 100%)"
        textColor="#EFF6FF"
        chipGrad="linear-gradient(135deg,#FDE68A,#F59E0B)"
        boxShadow="0 8px 32px rgba(59,130,246,0.15), 0 2px 8px rgba(0,0,0,0.07)"
        border="1.5px solid rgba(59,130,246,0.3)"
        eyebrow="UIDAI · Govt. of India"
        issuer="Aadhaar Identity Verification"
        numberLabel="Aadhaar Number"
        number={data.aadhaar_number}
        holderLabel="Name"
        holder={data.full_name}
        tag="Verified"
        fields={[
          ...(data.dob     ? [{ label: "Date of birth", value: data.dob }]    : []),
          ...(data.gender  ? [{ label: "Gender",         value: data.gender }] : []),
          ...(data.address ? [{ label: "Address",        value: data.address, wide: true }] : []),
        ]}
        footer={{ label: "Verified via UIDAI DigiLocker · Aadhaar is always masked", date: today }}
      />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 2B — GST VERIFICATION (business path)
════════════════════════════════════════════════════════════════════ */
function Step2GST({ docData, setDocData }) {
  const [gst,   setGst]   = useState(docData?.gst_number || "");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState(
  docData?.gstVerified ? "verified" : "idle"
);

  const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/;

  if (phase === "verified") {
    return (
      <StepShell icon={Fingerprint} title="GST verification"
        desc="GSTIN verified successfully against the GST Network.">
        <div className="space-y-4">
          <GSTCertificate data={docData} />
        </div>
      </StepShell>
    );
  }

  const handleVerify = async () => {
    const val = gst.trim().toUpperCase();
    if (!GST_REGEX.test(val)) {
      setError("Enter a valid 15-character GSTIN (e.g. 29ABCDE1234F1Z5)");
      return;
    }
    setError("");
    try {
      setPhase("verifying");
      const res = await verifyGST(val);
      /* Map actual API response fields */
      setDocData(p => ({
        ...p,
        gst: val,
        gstVerified: true,
        legalName:        res?.legalName        ?? res?.legal_name        ?? "—",
        tradeName:        res?.tradeName        ?? res?.trade_name        ?? "—",
        status:           res?.status           ?? "Active",
        state:            res?.state            ?? "—",
        registrationDate: res?.registrationDate ?? res?.registration_date ?? "—",
      }));
      setPhase("verified");
    } catch(e) {
      setError(e?.message || "GST verification failed. Please try again.");
      setPhase("idle");
    }
  };

  return (
    <StepShell icon={Fingerprint} title="GST verification"
      desc="Verify your GST registration number with the GSTN database.">
      <div className="max-w-lg space-y-5">
        <AnimatePresence mode="wait">
          {phase === "verifying" ? (
            <motion.div key="vfy" {...fadeUp}>
              <VerifyingCert title="Verifying with GST Network"
                messages={["Validating GSTIN format…","Querying GSTN database…","Fetching registration details…"]}
                accentColor="#0EA5E9" />
            </motion.div>
          ) : (
            <motion.div key="form" {...fadeUp} className="space-y-5">
              <Field label="GSTIN" required error={error}>
                <input value={gst} maxLength={15}
                  onChange={e => { setGst(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"")); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleVerify()}
                  placeholder="29ABCDE1234F1Z5"
                  className={`${iCls(!!error)} font-mono tracking-wider`} />
              </Field>
              <GradBtn onClick={handleVerify} icon={BadgeCheck} full
                disabled={gst.trim().length !== 15}>
                Verify GST registration
              </GradBtn>
              <InfoNote>
                🇮🇳 GST details are verified against the GSTN portal before onboarding.
              </InfoNote>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StepShell>
  );
}

/* ─── GST Certificate ────────────────────────────────────────────── */
export function GSTCertificate({ data }) {
  const today = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

  return (
    <motion.div {...certAnim}>
      {/* No extra fields here on purpose: the API's "trade name" is the
          same value as "legal name" (data.company_name) for every GST
          response we've seen — showing it twice would be exactly the
          repeated content this redesign is meant to remove. */}
      <IdCardFace
        grad="linear-gradient(135deg,#0369A1 0%,#0EA5E9 45%,#075985 100%)"
        textColor="#F0F9FF"
        chipGrad="linear-gradient(135deg,#FDE68A,#F59E0B)"
        boxShadow="0 8px 32px rgba(14,165,233,0.14), 0 2px 8px rgba(0,0,0,0.07)"
        border="1.5px solid rgba(14,165,233,0.35)"
        eyebrow="GST Network (GSTN) · Govt. of India"
        issuer="GST Registration"
        numberLabel="GSTIN"
        number={data?.gst_number}
        holderLabel="Legal Name"
        holder={data?.company_name}
        tag="Verified"
        footer={{ label: "Verified via GSTN portal · Ministry of Finance, Government of India", date: today }}
      />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 3 — BANK ACCOUNT VERIFICATION
════════════════════════════════════════════════════════════════════ */
function Step3Bank({ bankData, setBankData, onVerified }) {
  const [phase,   setPhase]   = useState(bankData ? "verified" : "idle");
  const [account, setAccount] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ifsc,    setIfsc]    = useState("");
  const [errors,  setErrors]  = useState({});

  if (phase === "verified" && bankData) {
    return (
      <StepShell title="Bank account verification" icon={Landmark}
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
    if (!account.trim())                              e.account = "Account number is required";
    if (!confirm.trim())                              e.confirm  = "Please confirm account number";
    else if (account.trim() !== confirm.trim())       e.confirm  = "Account numbers do not match";
    if (!ifsc.trim())                                 e.ifsc     = "IFSC code is required";
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
      // Bank is the last verification before Documents/Review — resync
      // with the backend so a refresh resumes at the correct step.
      if (onVerified) onVerified();
    } catch(e) {
      setErrors({ _: e?.message || "Verification failed. Please try again." });
      setPhase("idle");
    }
  };

  return (
    <StepShell title="Bank account verification" icon={Landmark}
      desc="Verify your business bank account for payouts and settlements.">
      <AnimatePresence mode="wait">
        {phase === "verifying" ? (
          <motion.div key="vfy" {...fadeUp}>
            <VerifyingCert title="Verifying bank account"
              messages={["Validating IFSC code…","Initiating penny-drop verification…","Confirming account details…"]}
              accentColor="#10B981" />
          </motion.div>
        ) : (
          <motion.div key="form" {...fadeUp} className="max-w-md space-y-5">
            <Field label="Account number" required error={errors.account}>
              <input type="text" placeholder="Enter account number"
                value={account}
                onChange={e => { setAccount(e.target.value.replace(/\D/g,"")); setErrors(p=>({...p,account:undefined})); }}
                className={iCls(!!errors.account)} />
            </Field>
            <Field label="Confirm account number" required error={errors.confirm}>
              <input type="text" placeholder="Re-enter account number"
                value={confirm}
                onPaste={e => e.preventDefault()}
                onChange={e => { setConfirm(e.target.value.replace(/\D/g,"")); setErrors(p=>({...p,confirm:undefined})); }}
                className={iCls(!!errors.confirm)} />
            </Field>
            <Field label="IFSC code" required error={errors.ifsc}>
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
            <GradBtn onClick={handleVerify} icon={BadgeCheck} full
              disabled={!account || !confirm || !ifsc}>
              Verify bank account
            </GradBtn>
            <InfoNote>
              Penny-drop verification confirms your account is active. No amount is debited.
            </InfoNote>
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}

/* ─── Bank Certificate ───────────────────────────────────────────── */
export function BankCertificate({ data }) {
  const isVerified = data.status?.toLowerCase() === "verified";
  const today = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

  return (
    <motion.div {...certAnim}>
      <IdCardFace
        grad="linear-gradient(135deg,#047857 0%,#10B981 45%,#065F46 100%)"
        textColor="#ECFDF5"
        chipGrad="linear-gradient(135deg,#FDE68A,#F59E0B)"
        boxShadow="0 8px 32px rgba(16,185,129,0.14), 0 2px 8px rgba(0,0,0,0.07)"
        border="1.5px solid rgba(16,185,129,0.35)"
        eyebrow="Penny-Drop Verification · RBI Compliant"
        issuer={data.bank_name ?? "Bank Account"}
        numberLabel="Account Number"
        number={data.account_masked}
        holderLabel="Account Holder"
        holder={data.account_holder}
        tag={isVerified ? "Verified" : data.status}
        fields={[
          { label: "IFSC code", value: data.ifsc },
          ...(data.branch ? [{ label: "Branch", value: data.branch }] : []),
        ]}
        footer={{ label: "Verified via penny-drop · No debit was made to this account", date: today }}
      />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 4 — DOCUMENT UPLOAD
════════════════════════════════════════════════════════════════════ */
function Step4Doc({ docData, setDocData, panData }) {
  const [phase, setPhase] = useState(
    (docData?.file || docData?.fileName) ? "done" : "idle"
  );
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("File size must be under 5 MB."); return; }
    setError("");
    try {
      setPhase("validating");
      setDocData(p => ({ ...p, file, fileName:file.name, match:null }));
      const result = await validateDocument(file, panData?.pan_number);
      setDocData(p => ({ ...p, file, fileName:file.name, ...result }));
      setPhase("done");
    } catch(e) {
      setError(e?.message || "Upload failed. Please try again.");
      setDocData(p => ({ ...p, file:null, fileName:null, match:null }));
      setPhase("idle");
    }
  };

  return (
    <StepShell title="Property Verification Document" icon={Upload}
      desc="  Upload a Property Ownership or Occupancy Document">
      <AnimatePresence mode="wait">
        {phase === "validating" ? (
          <motion.div key="vfy" {...fadeUp}>
            <VerifyingCert title="Processing document"
              messages={["Analyzing document…","Running format checks…","Preparing for review…"]}
              accentColor="#a44bf3" />
          </motion.div>
        ) : (
          <motion.div key="upload" {...fadeUp} className="space-y-4 max-w-xl">
            <motion.label htmlFor="pan-doc"
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
              onDragOver={e => e.preventDefault()}
              whileHover={{ scale:1.005 }}
              className={[
                "flex cursor-pointer flex-col items-center justify-center gap-3",
                "rounded-2xl border-2 border-dashed px-6 py-10 transition-all",
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 shrink-0">
                    <FileText size={22} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 max-w-[260px] truncate">
                      {docData.file?.name ?? docData.fileName}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Click to replace · Max 5 MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                    <Upload size={24} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Property verification document · Click to replace
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG · PNG · PDF · Max 5 MB</p>
                  </div>
                </div>
              )}
            </motion.label>

            {error && <ErrMsg text={error} />}

            {phase === "done" && (docData?.file || docData?.fileName) && (
              <motion.div {...certAnim}
                className="flex items-start gap-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-0.5">
                    Document uploaded successfully
                  </p>
                  <p className="text-[11.5px] text-emerald-700/70 dark:text-emerald-400/70 leading-snug">
                    This will be reviewed by the venuebook.in verification team during KYC approval.
                  </p>
                </div>
              </motion.div>
            )}

            <InfoNote>
Upload <strong>any ONE</strong> of the following documents to verify your property:
<ul className="mt-2 list-disc pl-5 space-y-1 text-xs">
  <li>Sale Deed</li>
  <li>Khata Certificate</li>
  <li>Patta</li>
  <li>RTC / Pahani (Agricultural Land)</li>
  <li>Lease / Rental Agreement</li>
  <li>Latest Property Tax Receipt</li>
  <li>Latest Electricity Bill</li>
  <li>Address Proof of Property</li>
</ul>

<p className="mt-3 text-[11px] text-gray-500">
  Water Bill is optional and may be requested if additional verification is required.
</p>
</InfoNote>

            {phase === "done" && (docData?.file || docData?.fileName) && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                By submitting you confirm all information provided is accurate and authorise
                venuebook.in to verify your identity for compliance purposes under Indian law.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   SUBMITTED VIEW
───────────────────────────────────────────────────────────────────── */
function SubmittedView({ onClose }) {
  return (
    <div className="flex flex-col items-center py-16 text-center gap-6">
      <motion.div
        initial={{ scale:0.5, opacity:0 }}
        animate={{ scale:1,   opacity:1 }}
        transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
        className="relative flex h-24 w-24 items-center justify-center rounded-full"
        style={{ background:GRAD }}>
        <CheckCircle2 size={40} className="text-white" strokeWidth={2} />
        <motion.div className="absolute inset-0 rounded-full" style={{ background:GRAD }}
          initial={{ scale:1, opacity:0.35 }}
          animate={{ scale:1.7, opacity:0 }}
          transition={{ duration:1.4, repeat:Infinity, repeatDelay:0.5 }} />
      </motion.div>

      <div className="max-w-sm">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">KYC submitted!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Our team will review your KYC within{" "}
          <strong className="text-gray-700 dark:text-gray-300">1–2 business days</strong>.
          You'll receive an email once your account is verified.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/30 px-5 py-2.5">
        <Clock size={14} className="text-blue-500" />
        <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Under review</span>
      </div>

      <motion.button type="button" onClick={onClose}
        whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
        className="rounded-xl px-8 py-3 text-sm font-semibold text-white cursor-pointer focus:outline-none shadow-lg shadow-violet-500/20"
        style={{ background:GRAD }}>
        Done
      </motion.button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
════════════════════════════════════════════════════════════════════ */

function StepShell({ icon: Icon, title, desc, children }) {
  return (
    <div className="pb-4">
      <div className="flex items-start gap-3.5 mb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5"
          style={{ background:GRAD_SOFT }}>
          <Icon size={18} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[16px] font-bold text-gray-900 dark:text-white leading-tight">{title}</h3>
          <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1 leading-snug max-w-lg">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   ID CARD FACE — the whole certificate now lives inside this one card:
   headline number + holder up top, any remaining details as compact
   rows further down, verification provenance as a footer strip — all
   on the same gradient, nothing repeated, no separate white table
   underneath. Sized to its content rather than a fixed aspect ratio,
   since "everything on one card" means variable-length values (an
   address, a business category) that a physical ID-card shape can't
   actually hold.

   Deliberately NOT a pixel copy of an actual PAN card or a bank debit
   card: no Ashoka Emblem / State-of-India insignia, no card-network
   logo (Visa/RuPay/etc.), no fabricated expiry/CVV. Those specific
   elements are what make a real PAN card or debit card a legally
   protected / regulated document design — reproducing them exactly
   risks looking like a forged ID rather than "verified data, nicely
   presented." This keeps the card *language* (emboss, chip, sheen,
   holder line) without claiming to *be* the real thing.
───────────────────────────────────────────────────────────────────── */
function IdCardFace({ grad, textColor, chipGrad, eyebrow, issuer, numberLabel, number, holderLabel, holder, tag, fields = [], footer, boxShadow, border }) {
  const rowBorder = `${textColor}26`;

  /* Full width at every breakpoint, mobile included — per explicit
     correction, no width cap on phones anymore. "Small on mobile" now
     comes entirely from compact type/spacing (see the tightened header
     block and field grid below), not from constraining the card's
     footprint. Height is intrinsic on every breakpoint too — no
     max-height, no internal scroll — so nothing is ever clipped or
     hidden behind a scrollbar regardless of field count.

     boxShadow/border live here (not on a wrapper) so the card doesn't
     need a second element duplicating its own rounding/shadow. */
  return (
    <div className="relative w-full
      overflow-hidden rounded-2xl flex flex-col"
      style={{ background: grad, boxShadow, border }}>
      {/* faint security-print texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{ backgroundImage: `repeating-linear-gradient(115deg, ${textColor} 0px, ${textColor} 1px, transparent 1px, transparent 9px)` }} />
      {/* soft sheen */}
      <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full pointer-events-none"
        style={{ background: textColor, opacity: 0.12, filter: "blur(28px)" }} />

      <div className="relative p-3.5 pb-0 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[7.5px] font-black uppercase tracking-[0.16em] opacity-75 break-words" style={{ color: textColor }}>
              {eyebrow}
            </p>
            <p className="text-[11.5px] font-extrabold leading-tight mt-0.5 break-words" style={{ color: textColor }}>
              {issuer}
            </p>
          </div>
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.18)" }}>
            <CheckCircle2 size={13} style={{ color: textColor }} strokeWidth={2.5} />
          </div>
        </div>

        <div className="mt-2.5">
          <p className="text-[7.5px] font-bold uppercase tracking-[0.14em] opacity-60 mb-1" style={{ color: textColor }}>
            {numberLabel}
          </p>
          <div className="flex items-center gap-2.5">
            <div className="relative h-6 w-9 shrink-0 rounded-[9px] overflow-hidden"
              style={{ background: chipGrad, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)" }}>
              <svg viewBox="0 0 36 24" className="absolute inset-0 h-full w-full" fill="none">
                <rect x="10" y="7.5" width="16" height="9" rx="2" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
                <line x1="18" y1="1.5" x2="18" y2="7.5" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
                <line x1="18" y1="16.5" x2="18" y2="22.5" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
                <line x1="1.5" y1="12" x2="10" y2="12" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
                <line x1="26" y1="12" x2="34.5" y2="12" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
                <line x1="1.5" y1="1.5" x2="10" y2="7.5" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
                <line x1="34.5" y1="1.5" x2="26" y2="7.5" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
                <line x1="1.5" y1="22.5" x2="10" y2="16.5" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
                <line x1="34.5" y1="22.5" x2="26" y2="16.5" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
              </svg>
            </div>
            <p className="text-[15px] font-bold font-mono tracking-[0.1em] truncate min-w-0" style={{ color: textColor }}>
              {number || "— — — — — — — — — —"}
            </p>
            {tag && (
              <span className="shrink-0 ml-auto inline-flex items-center rounded-full px-2 py-[3px] text-[7.5px] font-bold uppercase tracking-wide"
                style={{ background: "rgba(255,255,255,0.18)", color: textColor }}>
                {tag}
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 min-w-0 pb-2.5">
          <p className="text-[7.5px] font-bold uppercase tracking-[0.14em] opacity-60" style={{ color: textColor }}>
            {holderLabel}
          </p>
          <p className="text-[12px] font-semibold truncate" style={{ color: textColor }}>
            {holder || "—"}
          </p>
        </div>
      </div>

      {fields.length > 0 && (
        <div className="relative px-3.5 py-2.5" style={{ borderTop: `1px solid ${rowBorder}` }}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {fields.map(f => (
              <div key={f.label} className={`min-w-0 ${f.wide ? "col-span-2" : ""}`}>
                <p className="text-[7.5px] font-bold uppercase tracking-wide opacity-60 mb-0.5" style={{ color: textColor }}>
                  {f.label}
                </p>
                <p className="text-[11px] font-semibold leading-snug break-words" style={{ color: textColor }}>
                  {f.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {footer && (
        <div className="relative shrink-0 flex items-center justify-between gap-3 px-3.5 py-2"
          style={{ borderTop: `1px solid ${rowBorder}`, background: "rgba(0,0,0,0.08)" }}>
          <div className="flex items-center gap-1.5 min-w-0">
            <Shield size={10} style={{ color: textColor, opacity: 0.7 }} className="shrink-0" />
            <p className="text-[9px] truncate" style={{ color: textColor, opacity: 0.75 }}>{footer.label}</p>
          </div>
          <p className="text-[9px] font-mono shrink-0" style={{ color: textColor, opacity: 0.6 }}>{footer.date}</p>
        </div>
      )}
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

function Field({ label, required=false, error, children }) {
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
    <motion.p initial={{ opacity:0, y:-3 }} animate={{ opacity:1, y:0 }}
      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium">
      <AlertCircle size={12} className="shrink-0" />{text}
    </motion.p>
  );
}

function GradBtn({ onClick, disabled=false, icon:Icon, full=false, children }) {
  return (
    <motion.button type="button" onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      whileHover={!disabled ? { scale:1.02 } : undefined}
      whileTap={!disabled ? { scale:0.97 } : undefined}
      className={[
        "shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white",
        "disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none shadow-sm shadow-violet-500/15",
        full ? "w-full" : "",
      ].join(" ")}
      style={{ background:GRAD, pointerEvents: disabled ? "none" : "auto" }}>
      {Icon && <Icon size={15} />}
      {children}
    </motion.button>
  );
}

function VerifyingCert({ title, messages, accentColor="#a44bf3" }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1) % messages.length), 900);
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="h-[3px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <motion.div className="h-full w-2/5 rounded-full"
          style={{ background:accentColor }}
          animate={{ x:["-100%","350%"] }}
          transition={{ duration:1.6, repeat:Infinity, ease:"easeInOut" }} />
      </div>
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
          <Spinner accentColor={accentColor} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</p>
          <AnimatePresence mode="wait">
            <motion.p key={idx}
              initial={{ opacity:0, y:3 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-3 }}
              transition={{ duration:0.2 }}
              className="text-[11px] text-gray-400 mt-0.5">{messages[idx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        {[{lw:"w-24",vw:"w-2/3"},{lw:"w-20",vw:"w-1/2"},{lw:"w-28",vw:"w-3/4"},{lw:"w-24",vw:"w-1/3"}].map((r,i) => (
          <div key={i} className="flex items-stretch divide-x divide-gray-100 dark:divide-gray-800">
            <div className="w-36 shrink-0 px-5 py-3.5 bg-gray-50/80 dark:bg-gray-800/30">
              <div className={`h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${r.lw}`} />
            </div>
            <div className="flex-1 px-5 py-3.5">
              <div className={`h-3 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse ${r.vw}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner({ accentColor }) {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"
      style={{ color:accentColor ?? "#a44bf3" }}>
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
