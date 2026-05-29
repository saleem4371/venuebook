"use client";

import { X, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import FoodBadge from "../ui/FoodBadge";
import { usePriceCurrencySymbol } from "../ui/PriceDisplay";

/* ── Animation configs — identical to ModalBase ──────────────── */
const SPRING   = { type: "spring", damping: 32, stiffness: 280, mass: 0.9 };
const EASE_IN  = [0.4, 0, 1, 1];

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
  exit:    { opacity: 0, transition: { duration: 0.18, ease: EASE_IN } },
};

const panelVariants = {
  hidden:  { x: "100%", opacity: 0.6 },
  visible: { x: 0, opacity: 1, transition: SPRING },
  exit:    { x: "100%", opacity: 0, transition: { duration: 0.22, ease: EASE_IN } },
};

const INPUT_CLS =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 dark:border-white/5 dark:bg-white/[0.03] dark:text-white dark:placeholder-slate-500 dark:focus:border-violet-500 dark:focus:bg-white/5";

const PACKAGE_TYPES = [
  { value: 1, tkey: "pkg.adult"    },
  { value: 2, tkey: "pkg.child"    },
  { value: 0, tkey: "pkg.all_ages" },
];

const FOOD_TYPES = [
  { value: 1, tkey: "pkg.veg",     dotCls: "bg-emerald-500" },
  { value: 2, tkey: "pkg.non_veg", dotCls: "bg-rose-500"    },
  { value: 0, tkey: "pkg.food_both", dotCls: "bg-slate-400"   },
];

/* ─── Category row in the builder ───────────────────────────── */
function CategoryConfigRow({ category, onCountChange, onItemToggle, t }) {
  const [expanded, setExpanded] = useState(false);
  const currencySymbol = usePriceCurrencySymbol();

  const selectedCount = category.package_item.filter((i) => i.selected).length;
  const countNumber   = category.count_number ?? 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all dark:border-white/[0.07] dark:bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {category.item_category}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {category.package_item.length} {t("pkg.available")}
            {selectedCount > 0 && (
              <span className="ml-1.5 font-medium text-violet-500 dark:text-violet-400">
                · {selectedCount} {t("pkg.selected")}
              </span>
            )}
          </p>
        </div>

        {/* Qty stepper */}
        <div className="flex items-center gap-1.5">
          <span className="whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">
            {t("pkg.select_qty")}
          </span>
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-white/[0.07]">
            <button
              type="button"
              onClick={() => onCountChange(category.id, Math.max(0, countNumber - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-l-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            >
              <span className="text-base leading-none">−</span>
            </button>
            <input
              type="number"
              min="0"
              max={category.package_item.length}
              value={countNumber}
              onChange={(e) => onCountChange(category.id, Number(e.target.value))}
              className="h-7 w-10 bg-transparent text-center text-xs font-semibold text-slate-800 outline-none dark:text-white"
            />
            <button
              type="button"
              onClick={() =>
                onCountChange(category.id, Math.min(category.package_item.length, countNumber + 1))
              }
              className="flex h-7 w-7 items-center justify-center rounded-r-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            >
              <span className="text-base leading-none">+</span>
            </button>
          </div>
        </div>

        {countNumber > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/5"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Progress bar when items selected */}
      {countNumber > 0 && selectedCount > 0 && (
        <div className="mx-4 h-0.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.05]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (selectedCount / Math.max(countNumber, 1)) * 100)}%`,
              background: "linear-gradient(90deg,#a44bf3,#499ce8)",
            }}
          />
        </div>
      )}

      {/* Item chip picker */}
      {countNumber > 0 && expanded && (
        <div className="border-t border-slate-100 px-4 py-3 dark:border-white/[0.05]">
          <p className="mb-2.5 text-[10px] text-slate-500 dark:text-slate-400">
            {t("pkg.select_items_label")} ({selectedCount} {t("pkg.selected")})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {category.package_item.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemToggle(item.id, category.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                  item.selected
                    ? "border-transparent text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50/50 dark:border-white/[0.07] dark:bg-transparent dark:text-slate-300 dark:hover:border-violet-500/20 dark:hover:bg-violet-500/5"
                }`}
                style={item.selected ? { background: "linear-gradient(242deg,#a44bf3,#499ce8)" } : {}}
              >
                {item.selected && <Check size={10} strokeWidth={3} />}
                <FoodBadge type={item.food_pre} size="xs" />
                <span>
                  {item.item_name} · {currencySymbol}{Number(item.item_price).toLocaleString("en-IN")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DRAWER
═══════════════════════════════════════════════════════════════ */
export default function PackageBuilderDrawer({
  open,
  onClose,
  form,
  onChange,
  publishedCategories,
  onItemToggle,
  onCountChange,
  onSubmit,
  saving,
  t,
}) {
  const isEdit         = !!form.id;
  const currencySymbol = usePriceCurrencySymbol();

  /* SSR-safe portal mount */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  /* Escape key + scroll lock */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow    = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow    = "";
      document.body.style.touchAction = "";
    };
  }, [open, onClose]);

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(); };

  const drawerContent = (
    <AnimatePresence>
      {open && (
      <div
        className="fixed inset-0 z-[999] flex items-stretch justify-end"
        aria-modal="true"
        role="dialog"
      >
        {/* ── Backdrop — uniform blur matching reference design ── */}
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 bg-black/30 backdrop-blur-md dark:bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* ── Drawer panel — spring slide from right ── */}
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white dark:bg-[#0d1117]"
          style={{
            boxShadow: "-60px 0 180px -20px rgba(0,0,0,0.5), -1px 0 0 rgba(0,0,0,0.08)",
          }}
        >
        {/* Gradient left edge accent */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[2px]"
          style={{ background: "linear-gradient(180deg,transparent 0%,#a44bf3 30%,#499ce8 70%,transparent 100%)" }}
        />
        {/* Top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-violet-500/[0.06] to-transparent dark:from-violet-500/[0.10]" />
        {/* Inner left border shine */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/20 dark:bg-white/[0.04]" />

        {/* Fixed Header */}
        <div className="relative flex flex-shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-white/[0.06]">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {isEdit ? t("pkg.edit_package") : t("pkg.create_package")}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t("pkg.package_builder_subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          id="pkg-builder-form"
          onSubmit={handleSubmit}
          className="relative flex-1 space-y-6 overflow-y-auto px-6 py-5"
        >
          {/* Section 1: Package Details */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {t("pkg.package_details")}
            </h3>
            <div className="space-y-3">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t("pkg.package_name")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => onChange({ ...form, name: e.target.value })}
                  placeholder={t("pkg.package_name_placeholder")}
                  required
                  className={INPUT_CLS}
                />
              </div>

              {/* Package Type */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t("pkg.guest_type")} <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  {PACKAGE_TYPES.map((pt) => (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => onChange({ ...form, type: pt.value })}
                      className={`flex-1 rounded-xl border py-2 text-xs font-medium transition-all ${
                        form.type === pt.value
                          ? "border-transparent text-white shadow-md"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-300 dark:hover:bg-white/5"
                      }`}
                      style={form.type === pt.value ? { background: "linear-gradient(242deg,#a44bf3,#499ce8)" } : {}}
                    >
                      {t(pt.tkey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food preference */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t("pkg.food_preference")}
                </label>
                <div className="flex gap-2">
                  {FOOD_TYPES.map((ft) => (
                    <button
                      key={ft.value}
                      type="button"
                      onClick={() => onChange({ ...form, foodType: ft.value })}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-all ${
                        form.foodType === ft.value
                          ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${ft.dotCls}`} />
                      {t(ft.tkey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t("pkg.price_per_pax")} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => onChange({ ...form, price: e.target.value })}
                    placeholder="0"
                    required
                    className={`${INPUT_CLS} pl-7`}
                  />
                </div>
              </div>

              {/* Publish toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-white/5">
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    {t("pkg.publish_package")}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    {form.publish === 1 ? t("pkg.visible_to_guests") : t("pkg.hidden_from_guests")}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.publish === 1}
                  onClick={() => onChange({ ...form, publish: form.publish === 1 ? 0 : 1 })}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    form.publish === 1 ? "bg-violet-500" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition duration-200 ${
                      form.publish === 1 ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Section 2: Item Configuration */}
          <section>
            <div className="mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t("pkg.configure_items")}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t("pkg.configure_items_desc")}
              </p>
            </div>

            {publishedCategories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center dark:border-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("pkg.no_published_categories")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {publishedCategories.map((cat) => (
                  <CategoryConfigRow
                    key={cat.id}
                    category={cat}
                    onCountChange={onCountChange}
                    onItemToggle={onItemToggle}
                    t={t}
                  />
                ))}
              </div>
            )}
          </section>
        </form>

        {/* Fixed Footer */}
        <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            form="pkg-builder-form"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
          >
            {saving
              ? t("pkg.saving")
              : isEdit
              ? t("pkg.update_package")
              : t("pkg.create_package")}
          </button>
        </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
  return mounted ? createPortal(drawerContent, document.body) : null;
}
