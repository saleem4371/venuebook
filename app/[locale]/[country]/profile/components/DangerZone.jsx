"use client";

/**
 * /app/[locale]/[country]/profile/components/DangerZone.jsx
 *
 * Pinned to the very bottom of the page by page.jsx's render order. No
 * delete-account endpoint exists anywhere in services/*.js, so the confirm
 * step doesn't fire a real destructive call — it shows the same honest
 * "not connected yet" toast the rest of the unwired settings use, rather
 * than either faking success or silently deleting nothing while implying
 * it worked.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";

import { useToast } from "@/components/ToastProvider";

export default function DangerZone() {
  const t = useTranslations("profile.danger");
  const tSettings = useTranslations("profile.settings");
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const confirmDelete = () => {
    setConfirmOpen(false);
    toast.info(tSettings("comingSoon"));
  };

  return (
    <section className="rounded-3xl border-2 border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="shrink-0 w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
            <AlertTriangle size={14} className="text-red-600" />
          </span>
          <div>
            <h3 className="text-[13px] font-semibold text-red-700 dark:text-red-400">{t("title")}</h3>
            <p className="text-[11.5px] text-red-600/80 dark:text-red-400/70 mt-0.5 max-w-md">{t("deleteDescription")}</p>
          </div>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-[12px] font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shrink-0"
        >
          <Trash2 size={13} />
          {t("deleteAccount")}
        </button>
      </div>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmOpen(false)}
            className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-600" />
                </span>
                <button onClick={() => setConfirmOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <h4 className="text-[15px] font-semibold text-gray-900 dark:text-gray-50">{t("deleteAccount")}</h4>
              <p className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-1.5">{t("deleteDescription")}</p>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-[13px] font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors"
                >
                  {t("deleteCta")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
