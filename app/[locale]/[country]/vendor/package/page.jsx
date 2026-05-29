"use client";

/**
 * /vendor/package/page.jsx
 * Package Management — ONLY for Venues with PAX pricing model.
 * Access gate: activeCategory === "venues" AND pricingModel === "pax"
 * TODO: Replace usePricingModel() mock with real listing/pricing API.
 */

import { useVendorCategory } from "@/context/VendorCategoryContext";
import { useTranslations } from "next-intl";
import { Lock, Package, ArrowRight } from "lucide-react";
import PackagePageShell from "./components/PackagePageShell";

function usePricingModel() {
  return "pax"; // LOCALHOST MOCK — always PAX for venues
}

function NotAvailableState({ reason, t }) {
  return (
    <div className="relative flex min-h-[calc(100vh-120px)] w-full flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-200/60 blur-3xl dark:bg-white/[0.02]" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-slate-100/80 blur-3xl dark:bg-white/[0.015]" />
      </div>
      <div className="relative">
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-slate-200 dark:bg-white/[0.04]" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/60 dark:from-white/[0.03] dark:to-transparent" />
          <Lock size={28} className="relative text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
        </div>
        <h2 className="mb-3 text-xl font-bold text-slate-800 dark:text-white">
          {t("pkg.not_available")}
        </h2>
        <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {reason === "wrong_category" ? t("pkg.not_available_category") : t("pkg.not_available_pricing")}
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-medium text-slate-500 shadow-sm dark:border-white/5 dark:bg-white/5 dark:text-slate-400">
          <Package size={13} />
          {t("pkg.pax_venues_only")}
          <ArrowRight size={11} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
}

export default function PackagePage() {
  const t = useTranslations();
  const { activeCategory } = useVendorCategory();
  const pricingModel = usePricingModel();

  const tFn = (key, params) => {
    try { return t(key, params); }
    catch { return key.split(".").pop().replace(/_/g, " "); }
  };

  if (activeCategory !== "venues") return <NotAvailableState reason="wrong_category" t={tFn} />;
  if (pricingModel !== "pax")     return <NotAvailableState reason="wrong_pricing"   t={tFn} />;

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#030712] mt-[-56px] md:mt-[-20px]">
      <PackagePageShell />
    </div>
  );
}
