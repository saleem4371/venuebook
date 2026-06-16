"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { country_of_category } from "@/services/global.service";
import { parent_of_category } from "@/services/listing.service";
/* strip trailing 's' so "venues" → "venue" matches the API's cat.name */
// const toSingular = (s = "") => s.replace(/s$/, "");
const toSingular = (s) => String(s || "").replace(/s$/, "");

export default function CategorySelectModal({
  open,
  onClose,
  onSelect,
  defaultCategory = "venue",
}) {
  const [categories, setCategories] = useState([]);
  const [selected,   setSelected]   = useState(() => toSingular(defaultCategory));
  const [loading,    setLoading]     = useState(true);
  const [mounted,    setMounted]     = useState(false);

  /* Portal mount guard */
  useEffect(() => { setMounted(true); }, []);

  /* Load categories once */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await country_of_category();
        if (!cancelled) setCategories(Array.isArray(res?.data) ? res.data : []);
      } catch (_) {}
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  /* Reset selection when modal opens */
  useEffect(() => {
    if (open) setSelected(toSingular(defaultCategory));
  }, [open, defaultCategory]);

  /* Escape key */
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  /* Body scroll lock */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const activeCat = categories.find((c) => c.name === selected);

  useEffect(() => {
     //load();
    load_parent(activeCat);
  }, [activeCat]);

  const load_parent = async (activeCat) => {
    try {
      const resp = await parent_of_category(activeCat);
      setParentData(Array.isArray(resp?.data) ? resp.data : []);
      
    } catch (err) {
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  };



  const handleContinue = useCallback(() => onSelect(selected), [selected, onSelect]);


  const imageUrl  = activeCat?.image
    ? `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${activeCat.image}`
    : null;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="csm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.52)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 99998,
            }}
            aria-hidden="true"
          />

          {/* Panel — centred via margin auto trick to avoid transform-context issues */}
          <div
            style={{
              position: "fixed", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 99999,
              padding: "1rem",
              pointerEvents: "none",
            }}
          >
            <motion.div
              key="csm-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="csm-title"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.97,  y: 12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                pointerEvents: "auto",
                width: "100%",
                maxWidth: "820px",
                maxHeight: "min(88vh, 620px)",
                borderRadius: "20px",
                overflow: "hidden",
                display: "flex",
                background: "white",
                boxShadow: "0 32px 80px rgba(0,0,0,0.26), 0 0 0 1px rgba(0,0,0,0.06)",
              }}
              className="dark:bg-gray-900"
            >
              {/* ── LEFT: picker ── */}
              <div
                className="flex flex-col justify-center overflow-y-auto"
                style={{ flex: "1 1 0", minWidth: 0, padding: "2.5rem 2.5rem 2.5rem 2.75rem" }}
              >
                {/* Close */}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
                >
                  <X size={16} />
                </button>

                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 px-3 py-1.5 mb-5 self-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                    List on venuebook.in
                  </span>
                </div>

                {/* Headline */}
                <h2
                  id="csm-title"
                  className="text-[26px] sm:text-[32px] font-extrabold leading-[1.1] tracking-tight text-gray-900 dark:text-white mb-2"
                >
                  What are you{" "}
                  <span
                    style={{
                      display: "block",
                      background: "linear-gradient(242deg, #a44bf3, #499ce8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    listing today?
                  </span>
                </h2>

                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-6 max-w-[320px]">
                  Choose the category that best matches your property or service.
                </p>

                {/* Pills */}
                <div className="mb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                    Property type
                  </p>

                  {loading ? (
                    <div className="flex flex-wrap gap-2">
                      {[72, 88, 64, 80, 96, 76].map((w, i) => (
                        <div key={i} className="h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ width: w }} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const active = cat.name === selected;
                        const soon   = cat.name === "experience";
                        return (
                          <button
                            key={cat.name}
                            type="button"
                            onClick={() => !soon && setSelected(cat.name)}
                            disabled={soon}
                            className={[
                              "inline-flex items-center justify-center rounded-full border px-4 py-2 text-[13px] font-medium",
                              "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                              soon
                                ? "border-gray-200 dark:border-gray-800 text-gray-300 cursor-not-allowed opacity-60"
                                : active
                                  ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 hover:text-violet-600 cursor-pointer",
                            ].join(" ")}
                          >
                            {cat.label || cat.name}
                            {soon && <span className="ml-1 text-[9px] font-bold uppercase text-gray-400">Soon</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Description */}
                  {!loading && (
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={selected}
                        initial={{ opacity: 0, y: 3  }}
                        animate={{ opacity: 1, y: 0  }}
                        exit={{    opacity: 0, y: -3 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2 text-[12px] text-gray-400 dark:text-gray-500"
                      >
                        {activeCat?.description || activeCat?.desc || ""}
                      </motion.p>
                    </AnimatePresence>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!selected || loading}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[13.5px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200/40"
                    style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}
                  >
                    Continue <ArrowRight size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 rounded-xl text-[13px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* ── RIGHT: illustration ── */}
              <div
                className="hidden sm:flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50"
                style={{ width: "300px", flexShrink: 0, padding: "2rem" }}
              >
                {loading ? (
                  <div className="w-full aspect-square rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                ) : imageUrl ? (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selected}
                      src={imageUrl}
                      alt={activeCat?.label || selected}
                      className="w-full h-auto object-contain drop-shadow-lg"
                      style={{ maxHeight: "280px" }}
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1    }}
                      exit={{    opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      draggable="false"
                    />
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center gap-3 opacity-25">
                    <svg width="100" height="100" viewBox="0 0 120 120" fill="none">
                      <rect x="20" y="55" width="80" height="50" rx="5" stroke="#7c3aed" strokeWidth="2.5" fill="rgba(124,58,237,0.06)" />
                      <polyline points="12,57 60,20 108,57" stroke="#7c3aed" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                      <rect x="45" y="75" width="30" height="30" rx="3" stroke="#7c3aed" strokeWidth="2" fill="rgba(124,58,237,0.1)" />
                      <rect x="28" y="65" width="16" height="13" rx="2" stroke="#7c3aed" strokeWidth="1.8" fill="rgba(124,58,237,0.08)" />
                      <rect x="76" y="65" width="16" height="13" rx="2" stroke="#7c3aed" strokeWidth="1.8" fill="rgba(124,58,237,0.08)" />
                    </svg>
                    <p className="text-xs text-gray-400 font-medium text-center">Select a category</p>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
