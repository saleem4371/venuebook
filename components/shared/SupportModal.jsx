"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, PhoneCall, Headphones, X, ChevronRight } from "lucide-react";

export default function SupportModal({ open, onClose, defaultMessagePath }) {
  const params = useParams();
  const router = useRouter();

  const locale = params?.locale || "en";
  const country = params?.country || "in";

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

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
    const targetUrl = defaultMessagePath || `/${locale}/${country}/messages?tab=support`;
    router.push(targetUrl);
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
            onClick={onClose}
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
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 overflow-hidden z-10"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 end-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>

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

            {/* Support Options */}
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
              <div
                className="w-full flex items-center justify-between gap-3.5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 opacity-75 text-left cursor-not-allowed"
                title="Receive a Call form will be available in Part 2"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                    <PhoneCall size={18} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Receive a Call
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Part 2
                      </span>
                    </div>
                    <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Request a callback from our support specialist
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
