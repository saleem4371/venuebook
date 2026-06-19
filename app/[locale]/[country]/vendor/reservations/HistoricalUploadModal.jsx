"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
} from "lucide-react";

export default function HistoricalUploadModal({
  open,
  onClose,
  onUpload, // expects JSON array
}) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState([]);
  const [error, setError] = useState("");

  const chooseFile = () => inputRef.current?.click();

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setError("");

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // 👉 Convert Excel to JSON
        const json = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        setJsonData(json);
      } catch (err) {
        setError("Invalid Excel file");
        setJsonData([]);
      }
    };

    reader.readAsArrayBuffer(f);
  };

  const handleUpload = async () => {
    if (!jsonData.length) return;

    await onUpload(jsonData); // send JSON to API
    reset();
  };

  const reset = () => {
    setFile(null);
    setJsonData([]);
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
          />

          {/* modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-3xl border bg-white/80 backdrop-blur-xl shadow-2xl">

              {/* header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="font-bold text-xl">
                    Upload Excel → JSON
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Excel data will be converted to JSON
                  </p>
                </div>

                <button
                  onClick={reset}
                  className="p-2 rounded-xl hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">

                {/* upload box */}
                <div
                  onClick={chooseFile}
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/50 p-10 text-center hover:border-violet-500 transition"
                >
                  <UploadCloud className="mx-auto text-violet-600" size={46} />

                  <h3 className="mt-4 font-semibold">
                    Click or Upload Excel File
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    .xlsx, .xls supported
                  </p>

                  <input
                    hidden
                    ref={inputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleChange}
                  />
                </div>

                {/* error */}
                {error && (
                  <p className="text-red-500 text-sm mt-3">
                    {error}
                  </p>
                )}

                {/* preview */}
                {file && !error && (
                  <div className="mt-5 flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                    <FileSpreadsheet className="text-emerald-600" size={22} />

                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {file.name}
                      </div>

                      <div className="text-xs text-gray-500">
                        {jsonData.length} rows found
                      </div>
                    </div>

                    <CheckCircle2 className="text-emerald-600" size={18} />
                  </div>
                )}

                {/* actions */}
                <div className="mt-6 flex items-center justify-between">

                  <button
                    className="flex items-center gap-2 text-sm text-violet-600 hover:underline"
                    onClick={() => {
                      const sample = [
                        { name: "Test", amount: 1000 },
                      ];

                      const blob = new Blob(
                        [JSON.stringify(sample, null, 2)],
                        { type: "application/json" }
                      );

                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "sample.json";
                      a.click();
                    }}
                  >
                    <Download size={15} />
                    Download Sample
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={reset}
                      className="rounded-xl border px-5 py-2"
                    >
                      Cancel
                    </button>

                    <button
                      disabled={!jsonData.length}
                      onClick={handleUpload}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-2 text-white disabled:opacity-40"
                    >
                      Upload ({jsonData.length})
                    </button>
                  </div>

                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}