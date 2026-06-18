"use client";

import { useState } from "react";
import { Download, FileText, X } from "lucide-react";
import ModalBase from "./ModalBase";
import { ITEM_TEMPLATE_URL, CATEGORY_TEMPLATE_URL } from "@/services/package.service";

import * as XLSX from "xlsx";


const CATEGORY_TEMPLATE_URLS = "/templates/item.csv";
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

const [preview, setPreview] = useState([]);
const [headers, setHeaders] = useState([]);
const [rows, setRows] = useState([]);


  const isItems = mode === "items";

  const templateUrl = CATEGORY_TEMPLATE_URLS;//isItems ? ITEM_TEMPLATE_URL : CATEGORY_TEMPLATE_URL;

  // const handleFileChange = (e) => {
  //   setFile(e.target.files?.[0] ?? null);
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // if (!file || uploading) return;

  // const formData = new FormData();
  // formData.append("file", file);

  // await onUpload(formData);

    if (!rows.length) return;

  await onUpload(rows);
};

 const handleClose = () => {
  setFile(null);
  setHeaders([]);
  setPreview([]);
  onClose();
};

  const handleFileChange = (e) => {
  const selected = e.target.files?.[0];
  if (!selected) return;

  setFile(selected);

  const reader = new FileReader();

  reader.onload = (event) => {
    const data = event.target.result;

    const workbook = XLSX.read(data, {
      type: "array",
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    

    const json = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    

    if (!json.length) {
      
      setHeaders([]);
      setPreview([]);
      return;
    }
setRows(json);
    setHeaders(json[0]);
    setPreview(json.slice(1, 6)); // Preview first 5 rows
  };

  reader.readAsArrayBuffer(selected);
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
    <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
      {t("pkg.upload_info")}
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
{preview.length > 0 && (
  <div className="overflow-auto rounded-xl border border-slate-200 dark:border-white/5">
    <div className="px-3 py-2 text-xs font-semibold border-b border-slate-200 dark:border-white/5">
      Preview (First {preview.length} Rows)
    </div>

    <table className="min-w-full text-xs">
      <thead className="bg-slate-50 dark:bg-white/5">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="border-b border-r border-slate-200 dark:border-white/5 px-3 py-2 text-left"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {preview.map((row, i) => (
          <tr key={i}>
            {headers.map((_, j) => (
              <td
                key={j}
                className="border-b border-r border-slate-100 dark:border-white/5 px-3 py-2"
              >
                {row[j] ?? ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
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
