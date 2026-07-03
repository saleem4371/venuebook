"use client";


import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal }           from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShieldCheck, CreditCard, Fingerprint, Landmark,
  Upload, CheckCircle2, Clock, ChevronRight, ChevronLeft,
  AlertCircle, RefreshCw, Phone, BadgeCheck, FileText,
  XCircle, Shield, CheckCheck, Building2, User,
} from "lucide-react";

import {
  verifyPAN, sendAadhaarOTP, verifyAadhaarOTP,
  verifyBank, validateDocument,
  initializeDigilocker,
  verifyGST,
} from "@/services/kycVerification";

import { currency_icon,formatPrice , getCountry} from '@/lib/currency_format'

import { SubmitKYC, each_kyc_status } from "@/services/kyc.service";

/* ─── Design tokens ──────────────────────────────────────────────── */
const KYC_KEY   = "vb_kyc_v4";
const GRAD      = "linear-gradient(242deg,#a44bf3,#499ce8)";
const GRAD_SOFT = "linear-gradient(242deg,rgba(164,75,243,0.08),rgba(73,156,232,0.08))";
const COUNTRY   = { code: "IN", name: "India", flag: "🇮🇳" };

const CATEGORY_META = {
  personal: { label: "Personal Account",  icon: User,      color: "#7C3AED", bg: "#EDE9FE" },
  business: { label: "Business / Company", icon: Building2, color: "#0369A1", bg: "#E0F2FE" },
};

/* Steps visible in sidebar / stepper */
const STEPS = [
  { id: 0, label: "Category",     icon: Shield       },
  { id: 1, label: "PAN",          icon: CreditCard   },
  { id: 2, label: "Aadhaar / GST", icon: Fingerprint },
  { id: 3, label: "Bank Account", icon: Landmark     },
  { id: 4, label: "Documents",    icon: Upload       },
  { id: 5, label: "Review",       icon: ShieldCheck  },
];

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
   ROOT MODAL COMPONENT
════════════════════════════════════════════════════════════════════ */
export default function KYCModal({ open, setOpen , kycData }) {
  const [step,      setStep]      = useState(0);
  const [dir,       setDir]       = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const [category,    setCategory]    = useState(null);
  const [panData,     setPanData]     = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [bankData,    setBankData]    = useState(null);
  const [docData,     setDocData]     = useState(null);

  const countries = getCountry();



  /* ── Restore from localStorage ─────────────────────────────────── */
  // useEffect(() => {
  //   if (!open) return;
  //   try {
  //     const s = JSON.parse(localStorage.getItem(KYC_KEY) || "{}");
  //     if (s.category)    setCategory(s.category);
  //     if (s.panData)     setPanData(s.panData);
  //     if (s.aadhaarData) setAadhaarData(s.aadhaarData);
  //     if (s.bankData)    setBankData(s.bankData);
  //     if (s.docData)     setDocData(s.docData);
  //     if (s.step > 0)    setStep(s.step);
  //   } catch { /* noop */ }
  // }, [open]);

useEffect(() => {
  if (!open || !kycData) return;

  try {
    // ---------------- PAN ----------------
    if (kycData.pan) {
      const panDetails =
        typeof kycData.pan.doc_details === "string"
          ? JSON.parse(kycData.pan.doc_details)
          : kycData.pan.doc_details;

      // GST
      const gstDetails = kycData.gst
        ? typeof kycData.gst.doc_details === "string"
          ? JSON.parse(kycData.gst.doc_details)
          : kycData.gst.doc_details
        : null;

      const gstNumber =
        kycData.gst?.document_number ||
        gstDetails?.gstin_list?.[0]?.gstin ||
        "";

      setPanData({
        pan_number: kycData.pan.document_number,
        company_name: panDetails.full_name,
        business_category: panDetails.category,
        registered_address: panDetails.address?.full,
        status: panDetails.status,
        verification_status: kycData.pan.verification_status,
        fromBackend: true,
      });

      setDocData({
        company_name: panDetails.full_name,
        pan_number: kycData.pan.document_number,
        business_category: panDetails.category,
        registered_address: panDetails.address?.full,
        gst_number: gstNumber,
        gst_details: gstDetails,
        gstVerified: !!gstNumber,
        fileName: kycData.pan.file_url?.split("/").pop() || "",
      });
    }

    // ---------------- Aadhaar ----------------
    if (kycData.aadhaar) {
      const details =
        typeof kycData.aadhaar.doc_details === "string"
          ? JSON.parse(kycData.aadhaar.doc_details)
          : kycData.aadhaar.doc_details;

      setAadhaarData({
        full_name: details.name,
        dob: details.dob,
        gender: details.gender,
        address: details.address,
        aadhaar_number: details.masked_number,
        fromBackend: true,
      });
    }

    // ---------------- Bank ----------------
    if (kycData.bank) {
      setBankData({
        account_holder: kycData.bank.business_name,
        bank_name: kycData.bank.bank_name,
        branch: kycData.bank.branch_name,
        account_masked:
          "XXXX XXXX " +
          (kycData.bank.account_number?.slice(-4) || ""),
        ifsc: kycData.bank.ifsc,
        account_number: kycData.bank.account_number,
        account_type: kycData.bank.account_type,
        verification_status: kycData.bank.verification_status,
        status: kycData.bank.verification_status,
        fromBackend: true,
      });
    }
  } catch (err) {
    console.error("KYC Parse Error:", err);
  }
}, [open, kycData]);

  /* ── Persist to localStorage ───────────────────────────────────── */
useEffect(() => {
  if (!open) return;

  try {
    localStorage.setItem(
      KYC_KEY,
      JSON.stringify({
        category,
        panData,
        aadhaarData,
        bankData,
        docData: docData
          ? {
              ...docData,
              // File objects can't be stored
              file: undefined,
              fileName: docData.file?.name ?? docData.fileName ?? null,
            }
          : null,
        step,
      })
    );
  } catch (err) {
    console.error("[KYC Save]", err);
  }
}, [
  open,
  category,
  panData,
  aadhaarData,
  bankData,
  docData,
  step,
]);
  /* ── Pre-fill from backend if already verified ──────────────────── */
  // useEffect(() => {
  //   if (!open) return;
  //   each_kyc_status().then(res => {
  //     const d = res?.data;
  //     if (!d) return;
  //     if (d?.pan?.status === "verified" && !panData)
  //       setPanData({ pan_number:d.pan.document_number, company_name:d.pan.company_name,
  //         status:"Active", business_category:d.pan.business_category,
  //         registered_address:d.pan.registered_address, fromBackend:true });
  //     if (d?.aadhaar?.status === "verified" && !aadhaarData)
  //       setAadhaarData({ full_name:d.aadhaar.name, dob:d.aadhaar.dob, gender:d.aadhaar.gender,
  //         address:d.aadhaar.address,
  //         aadhaar_number:d.aadhaar.masked_number ?? "XXXX XXXX XXXX", fromBackend:true });
  //     if (d?.bank?.status === "verified" && !bankData)
  //       setBankData({ account_holder:d.bank.account_holder_name, bank_name:d.bank.bank_name,
  //         branch:d.bank.branch,
  //         account_masked:"xxxx xxxx "+d.bank.account_number?.slice(-4),
  //         ifsc:d.bank.ifsc, status:"Verified", fromBackend:true });
  //   }).catch(() => {});
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [open]);
useEffect(() => {
    if (!open || !kycData) return;

    if (kycData?.pan?.status === "verified") {
      setPanData({
        pan_number: kycData.pan.document_number,
        company_name: kycData.pan.company_name,
        status: "Active",
        business_category: kycData.pan.business_category,
        registered_address: kycData.pan.registered_address,
        fromBackend: true,
      });
    }

    if (kycData?.aadhaar?.status === "verified") {
      setAadhaarData({
        full_name: kycData.aadhaar.name,
        dob: kycData.aadhaar.dob,
        gender: kycData.aadhaar.gender,
        address: kycData.aadhaar.address,
        aadhaar_number:
          kycData.aadhaar.masked_number ?? "XXXX XXXX XXXX",
        fromBackend: true,
      });
    }

    if (kycData?.bank?.status === "verified") {
      setBankData({
        account_holder: kycData.bank.account_holder_name,
        bank_name: kycData.bank.bank_name,
        branch: kycData.bank.branch,
        account_masked:
          "xxxx xxxx " + (kycData.bank.account_number?.slice(-4) || ""),
        ifsc: kycData.bank.ifsc,
        status: "Verified",
        fromBackend: true,
      });
    }
  }, [open, kycData]);
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

  // const goNext = () => {
  //   if (!canAdvance()) return;
  //   setDir(1);
  //   setStep(s => Math.min(s + 1, 5));
  // };
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

  setStep((s) => Math.min(s + 1, 5));
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
      localStorage.removeItem(KYC_KEY);
      setSubmitted(true);
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
              "relative z-10 w-full sm:max-w-[960px]",
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
              onClose={handleClose}
              countries={countries}
            />

            {/* Mobile stepper */}
            {!submitted && (
              <div className="sm:hidden px-5 pb-3 shrink-0 border-b border-gray-100 dark:border-gray-800">
                <HorizontalStepper currentStep={step} progress={progress} />
              </div>
            )}

            {/* Two-column body */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

              {/* Sidebar */}
              {!submitted && (
                <aside className="hidden sm:flex flex-col w-[220px] shrink-0 border-r border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/20 py-6 px-5 gap-5">
                  <VerticalStepper currentStep={step} progress={progress} />
                  <ProgressSummary progress={progress} category={category} />
                </aside>
              )}

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="px-6 sm:px-8 pt-6 pb-5">
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
                          <Step1PAN panData={panData} docData={docData} setPanData={setPanData} setDocData={setDocData} category ={category} />
                        )}
                        {step === 2 && (
                          category === "personal"
                            ? <Step2Aadhaar aadhaarData={aadhaarData} setAadhaarData={setAadhaarData} />
                            : <Step2GST docData={docData} setDocData={setDocData} />
                        )}
                        {step === 3 && (
                          <Step3Bank bankData={bankData} setBankData={setBankData} />
                        )}
                        {step === 4 && (
                          <Step4Doc docData={docData} setDocData={setDocData} panData={panData} />
                        )}
                        {step === 5 && (
                          <Step5Review
                            panData={panData}
                            aadhaarData={aadhaarData}
                            bankData={bankData}
                            docData={docData}
                            category={category}
                          />
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
function KYCHeader({ submitted, step, category, onClose ,countries}) {
  const catMeta = category ? CATEGORY_META[category] : null;
  /* Display step as 1-based, skip step 0 in count */
  const displayStep = step === 0 ? 1 : step;
  const totalSteps  = 5;

  return (
    <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 shrink-0 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 min-w-0">
        {/* Shield icon */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{ background: GRAD }}>
          <ShieldCheck size={16} className="text-white" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white leading-tight">
              {submitted ? "Verification submitted" : "KYC verification"}
            </h2>

            {/* Country pill */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold
              bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400
              px-2 py-0.5 rounded-full">
                <img
        src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${countries.flag}`}
        alt={countries.name}
        className="w-5 h-5 rounded-full object-cover"
      />{countries.name}
            </span>

            {/* Category pill — shown once chosen */}
            {catMeta && !submitted && (
              <motion.span
                initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold
                  px-2 py-0.5 rounded-full"
                style={{ background: catMeta.bg, color: catMeta.color }}>
                <catMeta.icon size={10} />
                {catMeta.label}
              </motion.span>
            )}
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">
            {submitted
              ? "Documents are under review · 1–2 business days"
              : `Step ${displayStep} of ${totalSteps} · 256-bit encrypted`}
          </p>
        </div>
      </div>

      <button type="button" onClick={onClose} aria-label="Close KYC modal"
        className="flex h-8 w-8 items-center justify-center rounded-full
          text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800
          transition cursor-pointer focus:outline-none shrink-0 ml-2">
        <X size={15} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   VERTICAL STEPPER
───────────────────────────────────────────────────────────────────── */
function VerticalStepper({ currentStep, progress }) {
  return (
    <nav aria-label="KYC steps">
      {STEPS.map((s, i) => {
        const done   = progress[s.id] && s.id < currentStep;
        const active = s.id === currentStep;
        const last   = i === STEPS.length - 1;
        return (
          <div key={s.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300",
                  (done || active) ? "text-white" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400",
                  active ? "ring-[3px] ring-violet-400/25 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900/20" : "",
                ].join(" ")}
                style={(done || active) ? { background: GRAD } : undefined}>
                {done ? <CheckCircle2 size={13} strokeWidth={2.5} /> : s.id}
              </div>
              {!last && (
                <div className="w-px flex-1 mt-1 mb-1 min-h-[20px] bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-full">
                  <motion.div className="w-full rounded-full" style={{ background: GRAD }}
                    initial={{ height: "0%" }}
                    animate={{ height: done ? "100%" : "0%" }}
                    transition={{ duration: 0.45, ease: [0.16,1,0.3,1] }} />
                </div>
              )}
            </div>
            <div className="pb-5 pt-0.5">
              <p className={[
                "text-[12px] font-semibold leading-tight",
                active ? "text-gray-900 dark:text-white"
                : done  ? "text-gray-500 dark:text-gray-400"
                :         "text-gray-300 dark:text-gray-600",
              ].join(" ")}>{s.label}</p>
              {active && (
                <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
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
   PROGRESS SUMMARY
───────────────────────────────────────────────────────────────────── */
function ProgressSummary({ progress, category }) {
  const step2Label = category === "business" ? "GST Verified" : "Aadhaar Verified";
  const step4Label = category === "business" ? "Document Uploaded" : "PAN Doc Uploaded";

  const items = [
    { key: 1, label: "PAN Verified"   },
    { key: 2, label: step2Label       },
    { key: 3, label: "Bank Verified"  },
    { key: 4, label: step4Label       },
  ];
  const done = Object.values(progress).filter(Boolean).length;

  return (
    <div className="mt-auto">
      <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Progress</p>
          <span className="text-[11px] font-bold text-violet-500">{done}/5</span>
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
            animate={{ width: `${(done / 5) * 100}%` }}
            transition={{ duration: 0.5, ease:[0.16,1,0.3,1] }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   HORIZONTAL STEPPER (mobile)
───────────────────────────────────────────────────────────────────── */
function HorizontalStepper({ currentStep, progress }) {
  return (
    <div className="flex items-center pt-2">
      {STEPS.map((s, i) => {
        const done   = progress[s.id] && s.id < currentStep;
        const active = s.id === currentStep;
        return (
          <div key={s.id} className="flex items-center flex-1 min-w-0">
            <div className={[
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
              (done || active) ? "text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400",
              active ? "ring-2 ring-violet-400/25 ring-offset-1 ring-offset-white dark:ring-offset-gray-950" : "",
            ].join(" ")}
              style={(done || active) ? { background: GRAD } : undefined}>
              {done ? <CheckCircle2 size={11} /> : s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <motion.div className="h-full rounded-full" style={{ background: GRAD }}
                  initial={{ width: "0%" }}
                  animate={{ width: done ? "100%" : "0%" }}
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
   FOOTER — back on ALL steps; step 0 back = cancel
───────────────────────────────────────────────────────────────────── */
function KYCFooter({ step, loading, canAdvance, onBack, onNext, onSubmit }) {
  const isReview = step === 5;
  const backLabel = step === 0 ? "Cancel" : "Back";

  return (
    <div className="shrink-0 border-t border-gray-100 dark:border-gray-800
      px-5 sm:px-8 py-4 flex items-center justify-between gap-3
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

      {isReview ? (
        <motion.button type="button" onClick={onSubmit} disabled={loading}
          whileHover={!loading ? { scale:1.02 } : undefined}
          whileTap={!loading ? { scale:0.97 } : undefined}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5
            text-sm font-semibold text-white disabled:opacity-50
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
function Step0Category({ category, setCategory }) {
  return (
    <StepShell icon={Shield} title="Select account type"
      desc="Choose how you'll be using VenueBook. This determines which documents we need to verify.">
      <div className="max-w-md space-y-3">

        {[
          {
            key: "personal",
            icon: User,
            label: "Personal account",
            sub: "Individual venue owner or operator",
            docs: ["PAN card", "Aadhaar (via DigiLocker)", "Bank account"],
            accent: "#7C3AED",
            accentBg: "#EDE9FE",
            accentBorder: "border-violet-400",
            activeBg: "bg-violet-50/70 dark:bg-violet-950/20",
          },
          {
            key: "business",
            icon: Building2,
            label: "Business / Company",
            sub: "Registered company or partnership firm",
            docs: ["Company PAN", "GST registration", "Bank account"],
            accent: "#0369A1",
            accentBg: "#E0F2FE",
            accentBorder: "border-sky-400",
            activeBg: "bg-sky-50/70 dark:bg-sky-950/20",
          },
        ].map(opt => {
          const selected = category === opt.key;
          return (
            <motion.button key={opt.key} type="button" onClick={() => setCategory(opt.key)}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className={[
                "w-full p-5 rounded-2xl border-2 text-left transition-all duration-200",
                selected
                  ? `${opt.accentBorder} ${opt.activeBg}`
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
              ].join(" ")}>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl mt-0.5 transition-all"
                  style={{ background: selected ? opt.accentBg : "#F3F4F6" }}>
                  <opt.icon size={20} style={{ color: selected ? opt.accent : "#9CA3AF" }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white">{opt.label}</p>
                    {selected && (
                      <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{ background: opt.accent }}>
                        <CheckCheck size={11} className="text-white" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-400 mt-0.5 mb-3">{opt.sub}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {opt.docs.map(d => (
                      <span key={d} className="text-[10px] font-semibold px-2 py-1 rounded-full"
                        style={{
                          background: selected ? opt.accentBg : "#F9FAFB",
                          color: selected ? opt.accent : "#6B7280",
                        }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}

        <InfoNote>
          Once submitted, account type can only be changed via support verification.
          {" "}{COUNTRY.flag} KYC is mandatory for all Indian venue partners.
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

  if (phase === "verified" && panData) {
    return (
      <StepShell title="Company PAN verification" icon={CreditCard}
        desc="Verified against the Income Tax Department database.">
        <div className="space-y-4">
          <PANCertificate data={panData} />
          <button type="button"
            onClick={() => { setPanData(null); setPhase("idle"); setPan(""); setError(""); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-500 transition cursor-pointer">
            <RefreshCw size={11} /> Re-verify / change PAN
          </button>
        </div>
      </StepShell>
    );
  }

  // const handleVerify = async () => {
  //   const val = pan.trim().toUpperCase();
  //   if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val)) {
  //     setError("Enter a valid 10-character PAN (e.g. ABCDE1234F)");
  //     return;
  //   }
  //   setError("");
  //   try {
  //     setPhase("verifying");
  //     const param = {
  //       category:category,
  //       pan:val
  //     }
  //     const data = await verifyPAN(param);
  //     setPanData(data);
  //     setPhase("verified");
  //   } catch(e) {
  //     setError(e.message || "Verification failed. Please try again.");
  //     setPhase("idle");
  //   }
  // };
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

    console.log("verifyPAN payload:", param);

    const data = await verifyPAN(param);

    setPanData(data);
    setPhase("verified");

    if (category === "business" && data?.gst_number) {
  setDocData({
    gstVerified: 'verified',
    gst_number: data.gst_number,
    company_name: data.company_name,
    pan_number: data.pan_number,
    business_category: data.business_category,
    registered_address: data.registered_address,
    gst_details: data.gst_details,
  });
}

setPhase("verified");

alert( docData?.gstVerified )
  } catch (e) {
    console.error(e);
    setError(e?.message || "Verification failed. Please try again.");
    setPhase("idle");
  }
};
  return (
    <StepShell title="Company PAN verification" icon={CreditCard}
      desc="Enter your company's 10-digit PAN to verify with the Income Tax Department of India.">
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
function PANCertificate({ data }) {
  const isActive = data.status?.toLowerCase() === "active";
  const today = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

  return (
    <motion.div {...certAnim} className="rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 8px 32px rgba(245,158,11,0.14), 0 2px 8px rgba(0,0,0,0.07)",
        border: "1.5px solid rgba(245,158,11,0.35)",
      }}>
      <div className="relative px-6 pt-5 pb-6"
        style={{
          background: "linear-gradient(135deg,#FFFDF5 0%,#FFF8E0 50%,#FFFDF5 100%)",
          borderBottom: "1px solid rgba(245,158,11,0.2)",
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:`repeating-linear-gradient(-55deg,transparent 0,transparent 6px,rgba(245,158,11,0.04) 6px,rgba(245,158,11,0.04) 7px)` }} />
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none select-none"
          style={{ fontSize:"68px", opacity:0.045, lineHeight:1, color:"#92400E" }}>☸</div>

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl text-[22px]"
              style={{ background:"linear-gradient(135deg,#FEF3C7,#FDE68A)", border:"1.5px solid rgba(245,158,11,0.3)", boxShadow:"0 2px 6px rgba(245,158,11,0.18)" }}>
              🏛️
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-amber-700 mb-0.5">
                Income Tax Department · Government of India
              </p>
              <p className="text-[15px] font-extrabold text-amber-950 leading-tight">
                PAN Verification Certificate
              </p>
              <p className="text-[9px] text-amber-700/70 font-medium mt-0.5">
                Permanent Account Number · Ministry of Finance
              </p>
            </div>
          </div>
          <VerifiedSeal color="#10B981" label="VERIFIED" sub={["Income Tax","Department"]} />
        </div>
      </div>

      {/* Tricolor stripe */}
      <div className="flex h-[4px]">
        <div className="flex-1" style={{ background:"#FF9933" }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ background:"#138808" }} />
      </div>

      <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        <DocRow label="Company name"       value={data.company_name}    primary />
        <DocRow label="PAN number"         value={data.pan_number}      mono />
        <DocRow label="Status">
          <StatusBadge active={isActive} label={data.status} />
        </DocRow>
        {data.business_category   && <DocRow label="Business category"  value={data.business_category} />}
        {data.registered_address  && <DocRow label="Registered address" value={data.registered_address} />}
      </div>

      <CertFooter color="#F59E0B" textColor="text-amber-800/60" iconColor="text-amber-500"
        label="Verified via Income Tax Department, Government of India"
        date={today} />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 2A — AADHAAR VERIFICATION
════════════════════════════════════════════════════════════════════ */
function Step2Aadhaar({ aadhaarData, setAadhaarData }) {
  const [phase, setPhase] = useState(
    aadhaarData && aadhaarData !== "verified" ? "verified" : "input"
  );
  const [error, setError] = useState("");

  const handleDigilockerVerify = async () => {
    setError("");
    try {
      const res = await initializeDigilocker();
      const url = res?.data?.data?.url;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        /* Mark as "pending DigiLocker callback" — 
           actual data set via callback / polling in production */
        setPhase("awaiting");
      } else {
        setError("Unable to initialize DigiLocker. Please try again.");
      }
    } catch(e) {
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
      <div className="max-w-md space-y-5">

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
function AadhaarCertificate({ data }) {
  const today = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

  return (
    <motion.div {...certAnim} className="rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 8px 32px rgba(59,130,246,0.13), 0 2px 8px rgba(0,0,0,0.07)",
        border: "1.5px solid rgba(59,130,246,0.3)",
      }}>
      <div className="flex">
        {/* Vertical tricolor */}
        <div className="w-[6px] shrink-0 flex flex-col">
          <div className="flex-1" style={{ background:"#FF9933" }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ background:"#138808" }} />
        </div>

        <div className="flex-1 relative px-6 pt-5 pb-6"
          style={{
            background: "linear-gradient(135deg,#F0F7FF 0%,#DBEAFE 50%,#EFF6FF 100%)",
            borderBottom: "1px solid rgba(59,130,246,0.2)",
          }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage:`repeating-linear-gradient(60deg,transparent 0,transparent 5px,rgba(59,130,246,0.04) 5px,rgba(59,130,246,0.04) 6px)` }} />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl"
                style={{ background:"linear-gradient(135deg,#DBEAFE,#BFDBFE)", border:"1.5px solid rgba(59,130,246,0.25)", boxShadow:"0 2px 6px rgba(59,130,246,0.18)" }}>
                <Fingerprint size={20} className="text-blue-700" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-800 mb-0.5">
                  UIDAI · Government of India
                </p>
                <p className="text-[15px] font-extrabold text-blue-950 leading-tight">
                  Aadhaar Identity Verification
                </p>
                <p className="text-[9px] text-blue-700/70 font-medium mt-0.5">
                  Unique Identification Authority of India
                </p>
              </div>
            </div>
            <VerifiedSeal color="#3B82F6" label="VERIFIED" sub={["UIDAI","Verified"]} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        <DocRow label="Full name"      value={data.full_name}      primary />
        {data.dob    && <DocRow label="Date of birth" value={data.dob} />}
        {data.gender && <DocRow label="Gender"        value={data.gender} />}
        <DocRow label="Aadhaar number" value={data.aadhaar_number} mono />
        {data.address && <DocRow label="Address"      value={data.address} />}
      </div>

      <CertFooter color="#3B82F6" textColor="text-blue-800/60" iconColor="text-blue-400"
        label="Verified via UIDAI DigiLocker · Aadhaar is always masked"
        date={today} />
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
          {/* <button type="button"
            onClick={() => { setDocData(p => ({ ...p, gst:"", gstVerified:false })); setPhase("idle"); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-500 transition cursor-pointer">
            <RefreshCw size={11} /> Verify a different GSTIN
          </button> */}
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
function GSTCertificate({ data }) {
  console.log('GST ')
  console.log(data)
  const today = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

  return (
    <motion.div {...certAnim} className="rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 8px 32px rgba(14,165,233,0.12), 0 2px 8px rgba(0,0,0,0.07)",
        border: "1.5px solid rgba(14,165,233,0.35)",
      }}>
      <div className="relative px-6 pt-5 pb-6"
        style={{
          background: "linear-gradient(135deg,#F0F9FF 0%,#E0F2FE 50%,#F0F9FF 100%)",
          borderBottom: "1px solid rgba(14,165,233,0.2)",
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:`repeating-linear-gradient(45deg,transparent 0,transparent 8px,rgba(14,165,233,0.035) 8px,rgba(14,165,233,0.035) 9px)` }} />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl text-[22px]"
              style={{ background:"linear-gradient(135deg,#E0F2FE,#BAE6FD)", border:"1.5px solid rgba(14,165,233,0.3)", boxShadow:"0 2px 6px rgba(14,165,233,0.18)" }}>
              🏢
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-sky-800 mb-0.5">
                GST Network (GSTN) · Government of India
              </p>
              <p className="text-[15px] font-extrabold text-sky-950 leading-tight">
                GST Verification Certificate
              </p>
              <p className="text-[9px] text-sky-700/70 font-medium mt-0.5">
                Goods and Services Tax · Ministry of Finance
              </p>
            </div>
          </div>
          <VerifiedSeal color="#0EA5E9" label="VERIFIED" sub={["GSTN","Portal"]} />
        </div>
      </div>

      {/* Sky stripe */}
      <div className="h-[3px]" style={{ background:"linear-gradient(to right,#0EA5E9,#0284C7,#0EA5E9)" }} />

      <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        <DocRow label="GSTIN"        value={data?.gst_number}              mono primary />
        <DocRow label="Legal name"   value={data?.company_name} />
        <DocRow label="Trade name"   value={data?.company_name} />
        {/* <DocRow label="Status">
          <StatusBadge active={data.status?.toLowerCase() === "active"} label={data.status ?? "Active"} />
        </DocRow>
        {data.state            && <DocRow label="State"        value={data.state} />}
        {data.registrationDate && <DocRow label="Registration" value={data.registrationDate} />} */}
      </div>

      <CertFooter color="#0EA5E9" textColor="text-sky-800/60" iconColor="text-sky-400"
        label="Verified via GSTN portal · Ministry of Finance, Government of India"
        date={today} />
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
function BankCertificate({ data }) {
  const isVerified = data.status?.toLowerCase() === "verified";
  const today = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

  return (
    <motion.div {...certAnim} className="rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 8px 32px rgba(16,185,129,0.12), 0 2px 8px rgba(0,0,0,0.07)",
        border: "1.5px solid rgba(16,185,129,0.35)",
      }}>
      <div className="relative px-6 pt-5 pb-6"
        style={{
          background: "linear-gradient(135deg,#F4FDF8 0%,#DCFCE7 50%,#F4FDF8 100%)",
          borderBottom: "1px solid rgba(16,185,129,0.2)",
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:`repeating-linear-gradient(30deg,transparent 0,transparent 8px,rgba(16,185,129,0.04) 8px,rgba(16,185,129,0.04) 9px)` }} />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl"
              style={{ background:"linear-gradient(135deg,#DCFCE7,#A7F3D0)", border:"1.5px solid rgba(16,185,129,0.25)", boxShadow:"0 2px 6px rgba(16,185,129,0.18)" }}>
              <Landmark size={20} className="text-emerald-700" />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-emerald-800 mb-0.5">
                {data.bank_name ?? "Bank"} · Account Verification
              </p>
              <p className="text-[15px] font-extrabold text-emerald-950 leading-tight">
                Account Verification Certificate
              </p>
              <p className="text-[9px] text-emerald-700/70 font-medium mt-0.5">
                Penny-Drop Verification · RBI Compliant
              </p>
            </div>
          </div>
          <VerifiedSeal color="#10B981" label="VERIFIED" sub={["Bank Acct","Verified"]} />
        </div>
      </div>

      <div className="h-[3px]" style={{ background:"linear-gradient(to right,#10B981,#059669,#10B981)" }} />

      <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        <DocRow label="Bank"           value={data.bank_name}      primary />
        <DocRow label="Account holder" value={data.account_holder} />
        <DocRow label="Account number" value={data.account_masked} mono />
        <DocRow label="IFSC code"      value={data.ifsc}           mono />
        {data.branch && <DocRow label="Branch"        value={data.branch} />}
        <DocRow label="Status">
          <StatusBadge active={isVerified} label={data.status} />
        </DocRow>
      </div>

      <CertFooter color="#10B981" textColor="text-emerald-800/60" iconColor="text-emerald-500"
        label="Verified via penny-drop · No debit was made to this account"
        date={today} />
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
                    This will be reviewed by the VenueBook verification team during KYC approval.
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
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STEP 5 — REVIEW & SUBMIT
════════════════════════════════════════════════════════════════════ */
function Step5Review({ panData, aadhaarData, bankData, docData, category }) {
  const step2Label = category === "business" ? "GST verified" : "Aadhaar verified";
  const checks = [
    { key:1, label:"Company PAN verified",   icon:CreditCard,  done:!!panData },
    { key:2, label:step2Label,                icon:Fingerprint, done: category === "business" ? !!docData?.gstVerified : !!aadhaarData },
    { key:3, label:"Bank account verified",  icon:Landmark,    done:!!bankData },
    { key:4, label:"Property Verification Document",   icon:Upload,      done:!!(docData?.file || docData?.fileName) },
  ];
  const allDone = checks.every(c => c.done);

  return (
    <StepShell title="Review & submit" icon={ShieldCheck}
      desc="Review all verified details before submitting your KYC for approval.">

      {/* Status banner */}
      <div className={[
        "flex items-center gap-3 rounded-xl px-5 py-4 mb-5",
        allDone
          ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30"
          : "border border-gray-100 dark:border-gray-800",
      ].join(" ")}
        style={!allDone ? { background:GRAD_SOFT } : undefined}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: allDone ? "linear-gradient(135deg,#10b981,#059669)" : GRAD }}>
          <ShieldCheck size={17} className="text-white" />
        </div>
        <div>
          <p className={[
            "text-[13.5px] font-bold",
            allDone ? "text-emerald-800 dark:text-emerald-300" : "text-violet-800 dark:text-violet-300",
          ].join(" ")}>
            {allDone ? "Ready for VenueBook review" : "Verification in progress"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {checks.filter(c=>c.done).length} of {checks.length} verifications completed
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-5">
        {checks.map((c, i) => (
          <div key={c.key}
            className={["flex items-center gap-3 px-4 py-3",
              i < checks.length-1 ? "border-b border-gray-50 dark:border-gray-800/60" : ""].join(" ")}>
            <div className={["flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              c.done ? "text-white" : "bg-gray-100 dark:bg-gray-800"].join(" ")}
              style={c.done ? { background:GRAD } : undefined}>
              <c.icon size={14} className={c.done ? "text-white" : "text-gray-400 dark:text-gray-500"} />
            </div>
            <span className={["text-[13px] font-medium flex-1",
              c.done ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"].join(" ")}>
              {c.label}
            </span>
            {c.done ? (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} />
                <span className="text-[11px] font-bold">Complete</span>
              </div>
            ) : (
              <span className="text-[11px] font-medium text-amber-500">Pending</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
        By submitting you confirm all information is accurate and authorise VenueBook to verify
        your business identity for compliance purposes under Indian law.
      </p>
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
    <div className="pb-6">
      <div className="flex items-start gap-4 mb-8">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl mt-0.5"
          style={{ background:GRAD_SOFT }}>
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

function DocRow({ label, value, children, primary=false, mono=false }) {
  return (
    <div className="flex items-stretch divide-x divide-gray-100 dark:divide-gray-800">
      <div className="flex items-center w-36 shrink-0 px-5 py-2.5 bg-gray-50/80 dark:bg-gray-800/30">
        <span className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500 leading-tight">
          {label}
        </span>
      </div>
      <div className={[
        "flex-1 px-5 py-2.5",
        primary ? "text-[13px] font-bold text-gray-900 dark:text-white" : "text-[12px] font-semibold text-gray-700 dark:text-gray-300",
        mono ? "font-mono tracking-[0.1em]" : "",
      ].join(" ")}>
        {children ?? value}
      </div>
    </div>
  );
}

/* Reusable verification seal */
function VerifiedSeal({ color, label, sub }) {
  return (
    <div className="flex flex-col items-center shrink-0 gap-1.5">
      <div className="relative flex items-center justify-center rounded-full"
        style={{ width:62, height:62,
          background:`radial-gradient(circle at 38% 38%, #ffffff 40%, ${color}22 100%)`,
          border:`2px solid ${color}`,
          boxShadow:`0 3px 12px ${color}33` }}>
        <div className="absolute rounded-full pointer-events-none"
          style={{ inset:4, border:`1px dashed ${color}55` }} />
        <CheckCircle2 size={30} style={{ color }} className="relative z-10" strokeWidth={2} />
      </div>
      <div className="text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.16em] leading-none mb-0.5"
          style={{ color }}>{label}</p>
        <p className="text-[7.5px] font-medium uppercase tracking-[0.06em] leading-snug text-gray-400">
          {sub[0]}<br/>{sub[1]}
        </p>
      </div>
    </div>
  );
}

/* Status badge — active/inactive */
function StatusBadge({ active, label }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[12px] font-bold ${active ? "text-emerald-700" : "text-red-600"}`}>
      <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`} />
      {label}
    </span>
  );
}

/* Certificate footer bar */
function CertFooter({ color, textColor, iconColor, label, date }) {
  return (
    <div className="flex items-center justify-between px-6 py-2.5"
      style={{ borderTop:`1px solid ${color}22`,
        background:`linear-gradient(135deg,${color}06,${color}0a)` }}>
      <div className="flex items-center gap-2">
        <Shield size={10} className={`${iconColor} shrink-0`} />
        <p className={`text-[9px] ${textColor} font-medium`}>{label}</p>
      </div>
      <p className="text-[9px] text-gray-400 font-mono shrink-0">{date}</p>
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