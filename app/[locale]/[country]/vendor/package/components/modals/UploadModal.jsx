"use client";

import { useState } from "react";
import { Download, FileText, X } from "lucide-react";
import ModalBase from "./ModalBase";
import { ITEM_TEMPLATE_URL, CATEGORY_TEMPLATE_URL } from "@/services/package.service";

/**
 * UploadModal — bulk upload items or categories via CSV/XLSX.
 * mode: "items" | "categories"
 */
export default function UploadModal({
  open,
  onClose,
  mode,
  onUpload,
  uploading,
  t,
}) {
  const [file, setFile] = useState(null);
  const isItems = mode === "items";

  const templateUrl = isItems ? ITEM_TEMPLATE_URL : CATEGORY_TEMPLATE_URL;

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onUpload(file);
  };

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  return (
    <ModalBase
      open={open}
      onClose={handleClose}
      title={isItems ? t("pkg.upload_items") : t("pkg.upload_categories")}
      subtitle={t("pkg.upload_subtitle")}
      maxWidth="max-w-sm"
      variant="confirm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info banner */}
        <div className="flex gap-2.5 rounded-xl bg-blue-50/80 p-3 dark:bg-blue-500/10">
          <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            {t("pkg.upload_info")}
          </p>
        </div>

        {/* Template download */}
        <a
          href={templateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/5"
        >
          <Download size={13} />
          {t("pkg.download_template")}
        </a>

        {/* File picker */}
        {file ? (
          <div className="flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50/50 px-3.5 py-2.5 dark:border-violet-500/20 dark:bg-violet-500/5">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={14} className="shrink-0 text-violet-500" />
              <span className="truncate text-xs text-slate-700 dark:text-slate-200">
                {file.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="ml-2 flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-6 transition hover:border-violet-300 hover:bg-violet-50/30 dark:border-white/5 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/5">
            <FileText size={20} className="text-slate-400" strokeWidth={1.5} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t("pkg.select_csv_xlsx")}
            </span>
            <input
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={uploading || !file}
            className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(242deg,#a44bf3,#499ce8)" }}
          >
            {uploading ? t("pkg.uploading") : t("pkg.upload")}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
