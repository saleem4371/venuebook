"use client";

import { Camera, X, ImageIcon } from "lucide-react";
import ModalBase from "./ModalBase";
import { usePriceCurrencySymbol } from "../ui/PriceDisplay";

const INPUT_CLS =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 dark:border-white/5 dark:bg-white/[0.03] dark:text-white dark:placeholder-slate-500 dark:focus:border-violet-500 dark:focus:bg-white/5";

const FOOD_TYPES = [
  {
    value: 1,
    tkey: "pkg.veg",
    dotCls: "bg-emerald-500",
    activeCls:
      "border-emerald-400 bg-emerald-50/80 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/40",
  },
  {
    value: 2,
    tkey: "pkg.non_veg",
    dotCls: "bg-rose-500",
    activeCls:
      "border-rose-400 bg-rose-50/80 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/40",
  },
  {
    value: 0,
    tkey: "pkg.food_both",
    dotCls: "bg-slate-400",
    activeCls:
      "border-slate-400 bg-slate-100/80 text-slate-700 dark:bg-white/10 dark:text-slate-300 dark:border-white/20",
  },
];

/**
 * ItemModal — Add / Edit a menu item.
 * Layout: right-side panel (ModalBase variant="panel").
 * Desktop: two columns — image on left, form fields on right.
 * Mobile: stacked — image then form.
 */
export default function ItemModal({
  open,
  onClose,
  form,
  onChange,
  imagePreview,
  onImageChange,
  onRemoveImage,
  onSubmit,
  saving,
  t,
}) {
  const isEdit = !!form.id;
  const currencySymbol = usePriceCurrencySymbol();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onImageChange(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={isEdit ? t("pkg.edit_item") : t("pkg.add_item")}
      subtitle={t("pkg.item_modal_subtitle")}
      maxWidth="max-w-xl"
      variant="panel"
    >
      <form onSubmit={handleSubmit}>
        {/* Two-column layout: image | form */}
        <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">

          {/* ── Left: Image upload ─────────────────────────── */}
          <div className="sm:w-44 sm:flex-shrink-0">
            {imagePreview ? (
              <div className="relative overflow-hidden rounded-2xl sm:h-full sm:min-h-[180px]">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-44 w-full object-cover sm:h-full"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
                {/* Re-upload overlay on hover */}
                <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-end gap-1 pb-3 opacity-0 transition-opacity hover:opacity-100">
                  <div className="rounded-lg bg-black/60 px-2.5 py-1 backdrop-blur-sm">
                    <span className="text-[10px] font-medium text-white">Change</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            ) : (
              <label className="flex h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-violet-300 hover:bg-violet-50/30 dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-violet-500/30 dark:hover:bg-violet-500/5 sm:h-full sm:min-h-[200px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/[0.05]">
                  <ImageIcon size={20} className="text-slate-400 dark:text-slate-500" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {t("pkg.upload_image")}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                    JPG, PNG, WebP
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* ── Right: Form fields ─────────────────────────── */}
          <div className="flex flex-1 flex-col gap-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t("pkg.item_name")} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                placeholder={t("pkg.item_name_placeholder")}
                required
                className={INPUT_CLS}
              />
            </div>

            {/* Price */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t("pkg.price")} <span className="text-rose-500">*</span>
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

            {/* Food preference */}
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t("pkg.food_preference")}
              </label>
              <div className="flex gap-2">
                {FOOD_TYPES.map((ft) => (
                  <button
                    key={ft.value}
                    type="button"
                    onClick={() => onChange({ ...form, foodType: ft.value })}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition ${
                      form.foodType === ft.value
                        ? ft.activeCls
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-white/5 dark:bg-transparent dark:text-slate-400 dark:hover:bg-white/5"
                    }`}
                  >
                    <span className={`h-2 w-2 flex-shrink-0 rounded-full ${ft.dotCls}`} />
                    {t(ft.tkey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Spacer pushes footer to bottom on desktop */}
            <div className="flex-1" />

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/5"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={saving || !form.name.trim() || !form.price}
                className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
              >
                {saving ? t("pkg.saving") : isEdit ? t("save") : t("pkg.add")}
              </button>
            </div>
          </div>
        </div>
      </form>
    </ModalBase>
  );
}
