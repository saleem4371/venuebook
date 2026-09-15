"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  PhoneCall,
  Headphones,
  X,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { validateEmail, validatePhone } from "@/lib/validation";
import { submitCallRequest } from "@/services/support.service";

export default function SupportModal({ open, onClose, defaultMessagePath }) {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();

  const locale = params?.locale || "en";
  const country = params?.country || "in";

  const [step, setStep] = useState("options"); // "options" | "call-form" | "success"
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successRecord, setSuccessRecord] = useState(null);

  // Sync / reset state on open/close
  useEffect(() => {
    if (open) {
      setStep("options");
      setErrors({});
      setSubmitError("");
      setSuccessRecord(null);

      const fullName =
        user?.name ||
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
        "";

      setForm({
        name: fullName,
        phone: user?.phone || "",
        email: user?.email || "",
        description: "",
      });
    }
  }, [open, user]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, isSubmitting]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleSelectMessage = () => {
    onClose();
    const targetUrl =
      defaultMessagePath || `/${locale}/${country}/messages?tab=support`;
    router.push(targetUrl);
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (submitError) setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name || !form.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!form.phone || !form.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else if (!validatePhone(form.phone.trim())) {
      nextErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!form.email || !form.email.trim()) {
      nextErrors.email = "Email address is required";
    } else if (!validateEmail(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!form.description || !form.description.trim()) {
      nextErrors.description = "Description is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitCall = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!isLoggedIn) {
      setSubmitError("Please sign in to submit a support call request.");
      return;
    }

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const res = await submitCallRequest({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        description: form.description.trim(),
      });
      setSuccessRecord(res.data);
      setStep("success");
    } catch (err) {
      setSubmitError(
        err.message || "Failed to submit your call request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="support-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={!isSubmitting ? onClose : undefined}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Dialog Panel */}
          <motion.div
            key="support-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 overflow-hidden z-10"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
              className="absolute top-4 end-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              <X size={18} />
            </button>

            {/* Step 1: Selection Options */}
            {step === "options" && (
              <div className="flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 shadow-sm border border-violet-100/60 dark:border-violet-900/30">
                    <Headphones size={24} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 pr-6">
                    <h3
                      id="support-modal-title"
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-snug"
                    >
                      Contact Support
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      How would you like to connect with our team?
                    </p>
                  </div>
                </div>

                {/* Options list */}
                <div className="space-y-3">
                  {/* Option 1: Message */}
                  <button
                    type="button"
                    onClick={handleSelectMessage}
                    className="w-full flex items-center justify-between gap-3.5 p-4 rounded-2xl border border-violet-100 dark:border-violet-900/40 bg-gradient-to-r from-violet-50/50 to-transparent dark:from-violet-950/20 dark:to-transparent hover:border-violet-300 dark:hover:border-violet-700/60 hover:shadow-sm transition-all group text-left"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-violet-500/20 group-hover:scale-105 transition-transform">
                        <MessageSquare size={18} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Message
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
                            Active
                          </span>
                        </div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Chat directly with our team in your inbox
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0 rtl:rotate-180"
                    />
                  </button>

                  {/* Option 2: Receive a Call */}
                  <button
                    type="button"
                    onClick={() => setStep("call-form")}
                    className="w-full flex items-center justify-between gap-3.5 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-violet-300 dark:hover:border-violet-700/60 hover:bg-gradient-to-r hover:from-violet-50/40 hover:to-transparent dark:hover:from-violet-950/20 dark:hover:to-transparent hover:shadow-sm transition-all group text-left"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 shadow-sm border border-violet-100/60 dark:border-violet-900/30 group-hover:scale-105 group-hover:bg-violet-600 group-hover:text-white transition-all">
                        <PhoneCall size={18} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Receive a Call
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            Callback
                          </span>
                        </div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Request a callback from our support specialist
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0 rtl:rotate-180"
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Receive a Call Form */}
            {step === "call-form" && (
              <div className="flex flex-col min-h-0">
                {/* Header with back button */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setStep("options")}
                    disabled={isSubmitting}
                    aria-label="Back to options"
                    className="p-1.5 -ml-1 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ArrowLeft size={18} className="rtl:rotate-180" />
                  </button>
                  <div>
                    <h3
                      id="support-modal-title"
                      className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug"
                    >
                      Receive a Call
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Provide your details and we will call you back.
                    </p>
                  </div>
                </div>

                {/* Form Body (Scrollable if needed) */}
                <form
                  onSubmit={handleSubmitCall}
                  className="space-y-3.5 overflow-y-auto pr-1"
                  noValidate
                >
                  {/* General / Auth error */}
                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {!isLoggedIn && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>
                        Please log in to your account to submit a callback
                        request.
                      </span>
                    </div>
                  )}

                  {/* Name field */}
                  <div>
                    <label
                      htmlFor="support-call-name"
                      className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="support-call-name"
                      type="text"
                      disabled={isSubmitting}
                      value={form.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Your full name"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.name
                          ? "border-red-400 focus:ring-red-400/20"
                          : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-violet-500/20"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone No. field */}
                  <div>
                    <label
                      htmlFor="support-call-phone"
                      className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Phone No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="support-call-phone"
                      type="tel"
                      disabled={isSubmitting}
                      value={form.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="10-digit mobile number"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.phone
                          ? "border-red-400 focus:ring-red-400/20"
                          : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-violet-500/20"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email Address field */}
                  <div>
                    <label
                      htmlFor="support-call-email"
                      className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="support-call-email"
                      type="email"
                      disabled={isSubmitting}
                      value={form.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="name@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? "border-red-400 focus:ring-red-400/20"
                          : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-violet-500/20"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Description field */}
                  <div>
                    <label
                      htmlFor="support-call-description"
                      className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="support-call-description"
                      rows={3}
                      disabled={isSubmitting}
                      value={form.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Briefly describe what you would like to discuss..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                        errors.description
                          ? "border-red-400 focus:ring-red-400/20"
                          : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-violet-500/20"
                      }`}
                    />
                    {errors.description && (
                      <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Form actions */}
                  <div className="pt-2 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setStep("options")}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !isLoggedIn}
                      className="flex-[2] py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Request Call</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Success Confirmation */}
            {step === "success" && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                  <CheckCircle2 size={32} strokeWidth={2} />
                </div>

                <h3
                  id="support-modal-title"
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-snug"
                >
                  Call Request Received
                </h3>

                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 max-w-xs leading-relaxed">
                  Your call request has been submitted successfully. Our support
                  team will contact you soon.
                </p>

                {successRecord?.id && (
                  <div className="mt-4 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60 text-[11px] text-gray-600 dark:text-gray-300 font-mono">
                    Ref: <span className="font-semibold">{successRecord.id}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full mt-6 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
