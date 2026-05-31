"use client";

import { Shapes, Utensils, Package, ArrowRight, Download, Upload } from "lucide-react";
import ModalBase from "./ModalBase";
import { ITEM_TEMPLATE_URL, CATEGORY_TEMPLATE_URL } from "@/services/package.service";

const STEPS = [
  {
    num: 1,
    Icon: Shapes,
    tkey: "pkg.step_categories",
    desc: "Create menu categories to organize your items (Starters, Main Course, Desserts, etc.)",
  },
  {
    num: 2,
    Icon: Utensils,
    tkey: "pkg.step_items",
    desc: "Add food items to each category with name, price, and food preference.",
  },
  {
    num: 3,
    Icon: Package,
    tkey: "pkg.step_packages",
    desc: "Bundle items into preset packages with PAX pricing for easy booking.",
  },
];

/**
 * HelpModal — quick start guide shown on first visit.
 */
export default function HelpModal({
  open,
  onClose,
  onUploadItems,
  onUploadCategories,
  t,
}) {
  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={t("pkg.quick_guide")}
      subtitle={t("pkg.quick_guide_subtitle")}
      maxWidth="max-w-md"
      variant="confirm"
    >
      <div className="space-y-4">
        {/* Steps */}
        <div className="space-y-2.5">
          {STEPS.map((step, idx) => (
            <div key={step.num} className="flex gap-3">
              {/* Step number */}
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
              >
                {step.num}
              </div>

              {/* Step content */}
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-center gap-1.5">
                  <step.Icon size={13} className="text-violet-500 dark:text-violet-400 shrink-0" />
                  <p className="text-xs font-semibold text-slate-800 dark:text-white">
                    {t(step.tkey)}
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Arrow connector */}
              {idx < STEPS.length - 1 && (
                <div className="flex w-8 flex-shrink-0 items-center justify-center">
                  <ArrowRight size={12} className="text-slate-300 dark:text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 dark:bg-white/5" />

        {/* Quick upload section */}
        <div>
          <p className="mb-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            {t("pkg.bulk_upload_option")}
          </p>
          <div className="flex gap-2">
            <a
              href={CATEGORY_TEMPLATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <Download size={12} />
              {t("pkg.category_template")}
            </a>
            <a
              href={ITEM_TEMPLATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <Download size={12} />
              {t("pkg.item_template")}
            </a>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => { onClose(); onUploadCategories(); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
            >
              <Upload size={12} />
              {t("pkg.upload_categories")}
            </button>
            <button
              type="button"
              onClick={() => { onClose(); onUploadItems(); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
            >
              <Upload size={12} />
              {t("pkg.upload_items")}
            </button>
          </div>
        </div>

        {/* Got it */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {t("pkg.got_it")}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
