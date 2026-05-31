"use client";

/**
 * KYCModal — Premium 5-step identity & business verification flow.
 *
 * Steps:
 *   1. PAN Verification   — PAN number + card upload
 *   2. Bank Account       — bank name, account no, IFSC, account type
 *   3. Business Details   — business name, type, GST, address
 *   4. Document Upload    — Aadhaar, business reg doc, cancelled cheque
 *   5. Review & Submit    — summary → submitted state (under review)
 *
 * Design: fintech-grade, glassmorphism accents, premium spacing,
 *         smooth Framer Motion transitions, full dark-mode support.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal }                  from "react-dom";
import { motion, AnimatePresence }       from "framer-motion";



import {
  X, ShieldCheck, Building2, CreditCard,
  FileText, Upload, CheckCircle2, Clock,
  ChevronRight, ChevronLeft, AlertCircle,
} from "lucide-react";

import {
  SubmitKYC,
  each_kyc_status
} from "@/services/kyc.service";

/* ─────────────────────────────────────────────────────────────────────
   STEP DEFINITIONS
───────────────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, key: "pan",      label: "PAN",       icon: CreditCard  },
  { id: 2, key: "bank",     label: "Bank",       icon: Building2   },
  { id: 3, key: "business", label: "Business",   icon: FileText    },
  { id: 4, key: "docs",     label: "Documents",  icon: Upload      },
  { id: 5, key: "review",   label: "Review",     icon: ShieldCheck },
];

const INITIAL_FORM = {
  /* Step 1 */
  pan:        "",
  panFile:    null,
  /* Step 2 */
  bankName:   "",
  accountNo:  "",
  ifsc:       "",
  accountType:"",
  /* Step 3 */
  bizName:    "",
  bizType:    "",
  gst:        "",
  bizAddress: "",
  /* Step 4 */
  aadhaarFile: null,
  bizRegFile:  null,
  chequeFile:  null,
};

/* ─────────────────────────────────────────────────────────────────────
   MOTION PRESETS
───────────────────────────────────────────────────────────────────── */
const BACKDROP = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: 0.22 },
};

const MODAL = {
  initial:    { opacity: 0, scale: 0.96, y: 12 },
  animate:    { opacity: 1, scale: 1,    y: 0  },
  exit:       { opacity: 0, scale: 0.96, y: 12 },
  transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
};

const SLIDE = (dir) => ({
  initial:    { opacity: 0, x: dir * 28 },
  animate:    { opacity: 1, x: 0 },
  exit:       { opacity: 0, x: dir * -28 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
});


function KycBadge({ status }) {
  if (!status) return null;

  const map = {
    approved: {
      text: "Approved",
      cls: "bg-green-100 text-green-700",
    },
    pending: {
      text: "Under Review",
      cls: "bg-blue-100 text-blue-700",
    },
    rejected: {
      text: "Rejected",
      cls: "bg-red-100 text-red-700",
    },
  };

  const item = map[status];

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${item.cls}`}
    >
      {item.text}
    </span>
  );
}
/* ─────────────────────────────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────────────────────────────── */
export default function KYCModal({ open, setOpen }) {
  const [step,      setStep]      = useState(1);
  const [dir,       setDir]       = useState(1);   /* slide direction */
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});
  const [form,      setForm]      = useState(INITIAL_FORM);

  const [kycData, setKycData] = useState(null);

  const patch = useCallback((key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }, []);

  const validate = useCallback(() => {
    const e = {};
    // if (step === 1) {
    //   if (!form.pan.trim())   e.pan     = "PAN number is required";
    //   if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.trim().toUpperCase()))
    //     e.pan = "Enter a valid PAN (e.g. ABCDE1234F)";
    //   if (!form.panFile)      e.panFile = "Upload your PAN card";
    // }
    if (step === 1) {
  if (!form.pan.trim())
    e.pan = "PAN number is required";

  if (
    !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
      form.pan.trim().toUpperCase()
    )
  ) {
    e.pan = "Enter a valid PAN (e.g. ABCDE1234F)";
  }

  // Only require file if no uploaded PAN exists
  if (!form.panFile && !kycData?.pan?.file_url) {
    e.panFile = "Upload your PAN card";
  }
}
    if (step === 2) {
      if (!form.bankName.trim())  e.bankName  = "Bank name is required";
      if (!form.accountNo.trim()) e.accountNo = "Account number is required";
      if (!form.ifsc.trim())      e.ifsc      = "IFSC code is required";
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.trim().toUpperCase()))
        e.ifsc = "Enter a valid IFSC code";
      if (!form.accountType)      e.accountType = "Select account type";
    }
    if (step === 3) {
      if (!form.bizName.trim())  e.bizName  = "Business name is required";
      if (!form.bizType)         e.bizType  = "Select business type";
    }
    // if (step === 4) {
    //   if (!form.aadhaarFile) e.aadhaarFile = "Upload your Aadhaar card";
    // }
    if (step === 4) {
  // Only require Aadhaar if not already uploaded
  if (
    !form.aadhaarFile &&
    !kycData?.aadhaar?.file_url
  ) {
    e.aadhaarFile = "Upload your Aadhaar card";
  }
}
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [step, form]);

  const goNext = () => {
    if (!validate()) return;
    setDir(1);
    setStep((s) => Math.min(s + 1, 5));
  };
  const goBack = () => {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

 const handleSubmit = async () => {
  try {
    setLoading(true);

    const formData = new FormData();

formData.append("pan", form.pan);

// formData.append("panFile", form.panFile);

formData.append("bankName", form.bankName);
formData.append("accountNo", form.accountNo);
formData.append("ifsc", form.ifsc);
formData.append("accountType", form.accountType);

formData.append("bizName", form.bizName);
formData.append("bizType", form.bizType);
formData.append("gst", form.gst);
formData.append("bizAddress", form.bizAddress);

// if (form.aadhaarFile) {
//   formData.append("aadhaarFile", form.aadhaarFile);
// }

// if (form.bizRegFile) {
//   formData.append("bizRegFile", form.bizRegFile);
// }

// if (form.chequeFile) {
//   formData.append("chequeFile", form.chequeFile);
// }

if (form.panFile instanceof File) {
  formData.append("panFile", form.panFile);
}

if (form.aadhaarFile instanceof File) {
  formData.append("aadhaarFile", form.aadhaarFile);
}

if (form.bizRegFile instanceof File) {
  formData.append("bizRegFile", form.bizRegFile);
}

if (form.chequeFile instanceof File) {
  formData.append("chequeFile", form.chequeFile);
}

    /* API CALL */
    await SubmitKYC(formData);

    //kyc/submit


    setSubmitted(true);
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    setOpen(false);
    /* Reset after exit animation */
    setTimeout(() => {
      setStep(1); setDir(1);
      setSubmitted(false); setLoading(false);
      setErrors({}); setForm(INITIAL_FORM);
    }, 320);
  };

useEffect(() => {
  if (!open) return;

  const loadKyc = async () => {
    try {
      const res = await each_kyc_status();

      setKycData(res?.data);

      setForm((prev) => ({
        ...prev,

        pan: res?.data?.pan?.document_number || "",

        bankName: res?.data?.bank?.bank_name || "",
        accountNo: res?.data?.bank?.account_number || "",
        ifsc: res?.data?.bank?.ifsc || "",
        accountType: res?.data?.bank?.account_type || "",

        bizName: res?.data?.bank?.business_name || "",
        bizType: res?.data?.bank?.business_type || "",
        gst: res?.data?.bank?.gst_number || "",
        bizAddress: res?.data?.bank?.business_address || "",
      }));
    } catch (err) {
      console.log(err);
    }
  };

  loadKyc();
}, [open]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">

          {/* ── Backdrop ────────────────────────────────────────────── */}
          <motion.div
            {...BACKDROP}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* ── Modal shell ─────────────────────────────────────────── */}
          <motion.div
            {...MODAL}
            className={[
              "relative z-10 w-full",
              /* Mobile: bottom sheet; Desktop: centered card */
              "sm:max-w-[540px]",
              "bg-white dark:bg-gray-950",
              "rounded-t-3xl sm:rounded-2xl",
              "border-0 sm:border sm:border-gray-200/80 dark:sm:border-gray-800",
              "shadow-2xl shadow-black/20",
              "flex flex-col",
              "max-h-[92svh] sm:max-h-[88vh]",
              "overflow-hidden",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle — mobile only */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="h-1.5 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* ── Header ──────────────────────────────────────────── */}
            <ModalHeader
              submitted={submitted}
              step={step}
              onClose={handleClose}
            />

            {/* ── Progress stepper ────────────────────────────────── */}
            {!submitted && (
              <ProgressStepper currentStep={step} />
            )}

            {/* ── Scrollable content ──────────────────────────────── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-6 pb-2 pt-4">
                <AnimatePresence mode="wait" initial={false}>
                  {submitted ? (
                    <motion.div key="submitted" {...SLIDE(1)}>
                      <SubmittedState onClose={handleClose} />
                    </motion.div>
                  ) : (
                    <motion.div key={step} {...SLIDE(dir)}>
                      <StepContent
                        step={step}
                        form={form}
                        errors={errors}
                        patch={patch}
                        kycData={kycData}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Footer navigation ───────────────────────────────── */}
            {!submitted && (
              <ModalFooter
  step={step}
  loading={loading}
  kycStatus={kycData?.overall_status}
  onBack={goBack}
  onNext={goNext}
  onSubmit={handleSubmit}
/>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ─────────────────────────────────────────────────────────────────────
   MODAL HEADER
───────────────────────────────────────────────────────────────────── */
function ModalHeader({ submitted, step, onClose }) {
  return (
    <div className="flex items-start justify-between px-6 pt-5 pb-2 shrink-0">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
            aria-hidden="true"
          >
            <ShieldCheck size={14} className="text-white" />
          </div>
          <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
            {submitted ? "Verification Submitted" : "KYC Verification"}
          </h2>
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-snug ps-9">
          {submitted
            ? "Your documents are under review"
            : `Step ${step} of ${STEPS.length} — secure & encrypted`}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        <X size={15} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   PROGRESS STEPPER
───────────────────────────────────────────────────────────────────── */
function ProgressStepper({ currentStep }) {
  return (
    <div className="px-6 pb-3 pt-1 shrink-0">
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done    = s.id < currentStep;
          const active  = s.id === currentStep;
          const last    = i === STEPS.length - 1;

          return (
            <div key={s.id} className="flex items-center flex-1 min-w-0">
              {/* Node */}
              <div className="flex flex-col items-center shrink-0">
                <motion.div
                  animate={{
                    background: done
                      ? "linear-gradient(242deg,#a44bf3,#499ce8)"
                      : active
                      ? "linear-gradient(242deg,#a44bf3,#499ce8)"
                      : undefined,
                  }}
                  className={[
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold",
                    done   ? "text-white"
                    : active ? "text-white ring-2 ring-violet-400/40 ring-offset-1 ring-offset-white dark:ring-offset-gray-950"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500",
                  ].join(" ")}
                  style={
                    done || active
                      ? { background: "linear-gradient(242deg,#a44bf3,#499ce8)" }
                      : undefined
                  }
                >
                  {done ? <CheckCircle2 size={11} strokeWidth={2.5} /> : s.id}
                </motion.div>
                <span
                  className={[
                    "mt-0.5 text-[9px] font-medium whitespace-nowrap leading-none",
                    active
                      ? "text-violet-600 dark:text-violet-400"
                      : done
                      ? "text-gray-500 dark:text-gray-400"
                      : "text-gray-300 dark:text-gray-600",
                  ].join(" ")}
                >
                  {s.label}
                </span>
              </div>

              {/* Connector line */}
              {!last && (
                <div className="flex-1 h-px mx-1 mt-[-10px] overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg,#a44bf3,#499ce8)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: done ? "100%" : "0%" }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STEP CONTENT ROUTER
───────────────────────────────────────────────────────────────────── */
function StepContent({ step, form, errors, patch ,kycData}) {
  switch (step) {
    case 1: return <StepPAN      form={form} errors={errors} patch={patch}  status={kycData?.pan?.status} kycData={kycData} />;
    case 2: return <StepBank     form={form} errors={errors} patch={patch}   />;
    case 3: return <StepBusiness form={form} errors={errors} patch={patch} status={kycData?.aadhaar?.status}/>;
    case 4: return <StepDocs     form={form} errors={errors} patch={patch}   kycData={kycData}/>;
    case 5: return <StepReview   form={form} />;
    default: return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────
   STEP 1 — PAN VERIFICATION
───────────────────────────────────────────────────────────────────── */
function StepPAN({ form, errors, patch , status, kycData}) {
  return (
    <div className="space-y-4 pb-4">
      <StepHeader
        icon={CreditCard}
        title="PAN Verification"
        desc="Your PAN card is required for tax compliance and identity verification."
      />
      <Field label="PAN Number" error={errors.pan} required>
        <input
          type="text"
          placeholder="ABCDE1234F"
          maxLength={10}
          value={form.pan}
          onChange={(e) => patch("pan", e.target.value.toUpperCase())}
          className={inputCls(errors.pan)}
        />
      </Field>
      <FileUpload
        label="PAN Card"
        sublabel="JPG, PNG or PDF · Max 5 MB"
        value={form.panFile}
        error={errors.panFile}
        onChange={(f) => patch("panFile", f)}
      />
      <InfoBox text="Your PAN information is encrypted and stored securely." />

      {kycData?.pan?.file_url && (
  <a
    href={kycData.pan.file_url}
    target="_blank"
    rel="noreferrer"
    className="text-xs text-blue-500"
  >
    View Uploaded PAN
  </a>
)}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STEP 2 — BANK ACCOUNT
───────────────────────────────────────────────────────────────────── */
function StepBank({ form, errors, patch }) {
  return (
    <div className="space-y-4 pb-4">
      <StepHeader
        icon={Building2}
        title="Bank Account"
        desc="Payouts and settlements will be sent to this account."
      />
      <Field label="Bank Name" error={errors.bankName} required>
        <input
          type="text"
          placeholder="e.g. HDFC Bank"
          value={form.bankName}
          onChange={(e) => patch("bankName", e.target.value)}
          className={inputCls(errors.bankName)}
        />
      </Field>
      <Field label="Account Number" error={errors.accountNo} required>
        <input
          type="text"
          placeholder="Enter account number"
          value={form.accountNo}
          onChange={(e) => patch("accountNo", e.target.value.replace(/\D/g, ""))}
          className={inputCls(errors.accountNo)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="IFSC Code" error={errors.ifsc} required>
          <input
            type="text"
            placeholder="HDFC0001234"
            maxLength={11}
            value={form.ifsc}
            onChange={(e) => patch("ifsc", e.target.value.toUpperCase())}
            className={inputCls(errors.ifsc)}
          />
        </Field>
        <Field label="Account Type" error={errors.accountType} required>
          <select
            value={form.accountType}
            onChange={(e) => patch("accountType", e.target.value)}
            className={selectCls(errors.accountType)}
          >
            <option value="">Select</option>
            <option value="savings">Savings</option>
            <option value="current">Current</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STEP 3 — BUSINESS DETAILS
───────────────────────────────────────────────────────────────────── */
function StepBusiness({ form, errors, patch }) {
  return (
    <div className="space-y-4 pb-4">
      <StepHeader
        icon={FileText}
        title="Business Details"
        desc="Tell us about your business for compliance verification."
      />
      <Field label="Business / Trade Name" error={errors.bizName} required>
        <input
          type="text"
          placeholder="Your business name"
          value={form.bizName}
          onChange={(e) => patch("bizName", e.target.value)}
          className={inputCls(errors.bizName)}
        />
      </Field>
      <Field label="Business Type" error={errors.bizType} required>
        <select
          value={form.bizType}
          onChange={(e) => patch("bizType", e.target.value)}
          className={selectCls(errors.bizType)}
        >
          <option value="">Select type</option>
          <option value="individual">Individual / Sole Proprietor</option>
          <option value="partnership">Partnership Firm</option>
          <option value="pvt_ltd">Private Limited Company</option>
          <option value="llp">LLP</option>
          <option value="ngo">NGO / Trust</option>
        </select>
      </Field>
      <Field label="GST Number" sublabel="Optional">
        <input
          type="text"
          placeholder="22AAAAA0000A1Z5"
          maxLength={15}
          value={form.gst}
          onChange={(e) => patch("gst", e.target.value.toUpperCase())}
          className={inputCls(null)}
        />
      </Field>
      <Field label="Business Address" sublabel="Optional">
        <textarea
          rows={2}
          placeholder="Registered business address"
          value={form.bizAddress}
          onChange={(e) => patch("bizAddress", e.target.value)}
          className={`${inputCls(null)} resize-none`}
        />
      </Field>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STEP 4 — DOCUMENTS
───────────────────────────────────────────────────────────────────── */
function StepDocs({ form, errors, patch , kycData}) {
  return (
    <div className="space-y-4 pb-4">
      <StepHeader
        icon={Upload}
        title="Document Upload"
        desc="Upload clear, legible copies of the following documents."
      />
      {/* <FileUpload
        label="Aadhaar Card"
        sublabel="Front & back — JPG, PNG or PDF · Max 5 MB"
        value={form.aadhaarFile}
        error={errors.aadhaarFile}
        onChange={(f) => patch("aadhaarFile", f)}
        required
      />
      <FileUpload
        label="Business Registration"
        sublabel="GST cert, Shop Act, or Incorporation doc — Optional"
        value={form.bizRegFile}
        onChange={(f) => patch("bizRegFile", f)}
      />
      <FileUpload
        label="Cancelled Cheque"
        sublabel="For bank account verification — Optional"
        value={form.chequeFile}
        onChange={(f) => patch("chequeFile", f)}
      /> */}
      <FileUpload
  label="Aadhaar Card"
  sublabel="Front & back — JPG, PNG or PDF · Max 5 MB"
  value={form.aadhaarFile}
  error={errors.aadhaarFile}
  onChange={(f) => patch("aadhaarFile", f)}
/>

{kycData?.aadhaar?.file_url && (
  <a
    href={kycData.aadhaar.file_url}
    target="_blank"
    rel="noreferrer"
    className="text-xs text-blue-500"
  >
    View Uploaded Aadhaar
  </a>
)}

<FileUpload
  label="Business Registration"
  sublabel="GST cert, Shop Act, or Incorporation doc — Optional"
  value={form.bizRegFile}
  onChange={(f) => patch("bizRegFile", f)}
/>

{kycData?.business_doc?.file_url && (
  <a
    href={kycData.business_doc.file_url}
    target="_blank"
    rel="noreferrer"
    className="text-xs text-blue-500"
  >
    View Uploaded Business Document
  </a>
)}

<FileUpload
  label="Cancelled Cheque"
  sublabel="For bank account verification — Optional"
  value={form.chequeFile}
  onChange={(f) => patch("chequeFile", f)}
/>

{kycData?.cheque?.file_url && (
  <a
    href={kycData.cheque.file_url}
    target="_blank"
    rel="noreferrer"
    className="text-xs text-blue-500"
  >
    View Uploaded Cheque
  </a>
)}
      <InfoBox text="All documents are encrypted using 256-bit AES and stored securely." />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STEP 5 — REVIEW & SUBMIT
───────────────────────────────────────────────────────────────────── */
function StepReview({ form }) {
  const rows = [
    { label: "PAN Number",     value: form.pan       || "—" },
    { label: "PAN Document",   value: form.panFile   ? `✓ ${form.panFile.name}` : "—" },
    { label: "Bank Name",      value: form.bankName  || "—" },
    { label: "Account No.",    value: form.accountNo ? `••••${form.accountNo.slice(-4)}` : "—" },
    { label: "IFSC",           value: form.ifsc      || "—" },
    { label: "Account Type",   value: form.accountType || "—" },
    { label: "Business Name",  value: form.bizName   || "—" },
    { label: "Business Type",  value: form.bizType   || "—" },
    { label: "GST",            value: form.gst       || "Not provided" },
    { label: "Aadhaar",        value: form.aadhaarFile ? `✓ ${form.aadhaarFile.name}` : "—" },
  ];

  return (
    <div className="space-y-4 pb-4">
      <StepHeader
        icon={ShieldCheck}
        title="Review & Submit"
        desc="Please confirm your details before submitting for verification."
      />
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-4 px-4 py-2.5">
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
              {r.label}
            </span>
            <span className="text-[11px] text-gray-800 dark:text-gray-200 text-right truncate font-medium">
              {r.value}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
        By submitting, you confirm that all information provided is accurate and
        agree to our verification terms.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   SUBMITTED STATE
───────────────────────────────────────────────────────────────────── */
function SubmittedState({ onClose }) {
  return (
    <div className="flex flex-col items-center py-10 text-center gap-5">
      {/* Animated check */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
      >
        <CheckCircle2 size={36} className="text-white" strokeWidth={2} />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.6 }}
        />
      </motion.div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Documents Submitted!
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
          Our team will review your KYC within <strong className="text-gray-700 dark:text-gray-300">1–2 business days</strong>.
          You'll receive an email notification once verified.
        </p>
      </div>

      {/* Status pill */}
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/30 px-4 py-2">
        <Clock size={13} className="text-blue-500 dark:text-blue-400" />
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
          Under Review
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white cursor-pointer transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
      >
        Done
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   MODAL FOOTER
───────────────────────────────────────────────────────────────────── */
function ModalFooter({
  step,
  loading,
  kycStatus,
  onBack,
  onNext,
  onSubmit,
}) {
  const isFirst = step === 1;
  const isLast = step === 5;

  const isPending = kycStatus === "pending";
  const disableSubmit = loading || isPending;

  return (
    <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between gap-3">
      {!isFirst ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      ) : (
        <div />
      )}

      {isLast ? (
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={disableSubmit}
          whileHover={!disableSubmit ? { scale: 1.02 } : undefined}
          whileTap={!disableSubmit ? { scale: 0.97 } : undefined}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background:
              disableSubmit && !loading
                ? "#9ca3af"
                : "linear-gradient(242deg,#a44bf3,#499ce8)",
          }}
        >
          {loading ? (
            <>
              <Spinner />
              Submitting...
            </>
          ) : isPending ? (
            <>
              <Clock size={14} />
              Under Review
            </>
          ) : (
            <>
              <ShieldCheck size={14} />
              Submit KYC
            </>
          )}
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white"
          style={{
            background:
              "linear-gradient(242deg,#a44bf3,#499ce8)",
          }}
        >
          Continue
          <ChevronRight size={14} />
        </motion.button>
      )}
    </div>
  );
}
/* ─────────────────────────────────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────────────────────────────────── */
function StepHeader({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 mb-1">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5"
        style={{ background: "linear-gradient(242deg,rgba(164,75,243,0.12),rgba(73,156,232,0.12))" }}
        aria-hidden="true"
      >
        <Icon size={15} className="text-violet-600 dark:text-violet-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{title}</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function Field({ label, sublabel, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
        {label}
        {sublabel && <span className="normal-case font-normal text-gray-400 dark:text-gray-500">— {sublabel}</span>}
        {required && <span className="text-red-400 ms-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-[11px] text-red-500 dark:text-red-400"
        >
          <AlertCircle size={10} />
          {error}
        </motion.p>
      )}
    </div>
  );
}

function FileUpload({ label, sublabel, value, error, onChange, required }) {
  const inputRef = useRef(null);

  return (
    <Field label={label} sublabel={sublabel} error={error} required={required}>
      <motion.label
        htmlFor={`upload-${label}`}
        whileHover={{ scale: 1.005 }}
        className={[
          "flex cursor-pointer flex-col items-center justify-center gap-2",
          "rounded-xl border-2 border-dashed px-4 py-5",
          "transition-colors",
          value
            ? "border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20"
            : error
            ? "border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10"
            : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/30 dark:hover:bg-violet-950/10",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          id={`upload-${label}`}
          type="file"
          className="sr-only"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange(f);
          }}
        />
        {value ? (
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
            <CheckCircle2 size={16} strokeWidth={2} />
            <span className="text-xs font-medium max-w-[200px] truncate">{value.name}</span>
          </div>
        ) : (
          <>
            <Upload size={18} className="text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Click to upload
            </span>
          </>
        )}
      </motion.label>
    </Field>
  );
}

function InfoBox({ text }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 px-3.5 py-3">
      <ShieldCheck size={13} className="shrink-0 mt-0.5 text-emerald-500" aria-hidden="true" />
      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{text}</p>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

/* ── Input / Select class helpers ─────────────────────────────────── */
const inputCls = (err) =>
  [
    "w-full rounded-xl border px-3.5 py-2.5 text-sm",
    "bg-white dark:bg-gray-900",
    "text-gray-900 dark:text-gray-100",
    "placeholder:text-gray-400 dark:placeholder:text-gray-600",
    "outline-none transition",
    err
      ? "border-red-300 dark:border-red-700 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
      : "border-gray-200 dark:border-gray-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-400/20",
  ].join(" ");

const selectCls = (err) =>
  `${inputCls(err)} appearance-none cursor-pointer`;
