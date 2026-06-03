"use client";

import ModalBase from "./ModalBase";

const INPUT_CLS =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 dark:border-white/5 dark:bg-white/[0.03] dark:text-white dark:placeholder-slate-500 dark:focus:border-violet-500 dark:focus:bg-white/5";

/**
 * CategoryModal — Add / Edit a food category.
 * Small centered dialog (variant="confirm") — single field, no need for full panel.
 */
export default function CategoryModal({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  saving,
  t,
  onEditCategory
}) {
  const isEdit = !!form.id;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };


  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={isEdit ? t("pkg.edit_category") : t("pkg.add_category")}
      subtitle={t("pkg.category_modal_subtitle")}
      maxWidth="max-w-sm"
      variant="confirm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category name */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            {t("pkg.category_name")} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder={t("pkg.category_name_placeholder")}
            required
            autoFocus
            className={INPUT_CLS}
          />
        </div>

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
            disabled={saving || !form.name}
            className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
          >
            {saving ? t("pkg.saving") : isEdit ? t("save") : t("pkg.add")}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
