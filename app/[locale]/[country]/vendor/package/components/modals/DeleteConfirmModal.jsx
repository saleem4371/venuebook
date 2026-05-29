"use client";

import { Trash2 } from "lucide-react";
import ModalBase from "./ModalBase";

/**
 * DeleteConfirmModal — small centered confirmation dialog.
 * Uses ModalBase variant="confirm" to keep it compact.
 */
export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  deleting,
  t,
}) {
  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={t("pkg.delete_item")}
      maxWidth="max-w-sm"
      variant="confirm"
    >
      <div className="space-y-5">
        {/* Icon + message */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50 ring-1 ring-rose-100 dark:bg-rose-500/10 dark:ring-rose-500/20">
            <Trash2 size={17} className="text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {t("pkg.delete_item_confirm")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-rose-700 active:scale-95 disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-600"
          >
            {deleting ? t("pkg.deleting") : t("pkg.delete")}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
