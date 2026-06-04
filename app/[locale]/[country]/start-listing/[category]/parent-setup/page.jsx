"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BookmarkCheck, Loader2, Upload, X } from "lucide-react";

import lightLogo from "@/assets/logo.svg";
import darkLogo  from "@/assets/logo.png";
import { CATEGORY_LABELS } from "../../components/wizardConfig";

// ─── Input / label helpers (identical to BasicsStep) ──────────────────────
const inputCls = (invalid = false) => [
  "w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900",
  "text-gray-900 dark:text-white text-sm outline-none transition",
  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
  invalid
    ? "border-red-400 ring-1 ring-red-400"
    : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
].join(" ");

const Label = ({ children, required }) => (
  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

// ─── Section divider (matches spacing between BasicsStep fields) ───────────
const SectionHeading = ({ children }) => (
  <div className="pt-2">
    <h2 className="text-[15px] font-bold text-gray-900 dark:text-white mb-1">
      {children}
    </h2>
    <div className="h-px bg-gray-100 dark:bg-gray-800 mt-3 mb-6" />
  </div>
);

// ─── Single-file upload tile ───────────────────────────────────────────────
function ImageUpload({ label, hint, file, onChange, square = false }) {
  const ref = useRef();

  function pick(e) {
    const f = e.target.files?.[0];
    if (f) onChange(f);
    e.target.value = "";
  }

  const preview = file ? URL.createObjectURL(file) : null;
  const boxCls  = square
    ? "relative w-full aspect-square rounded-xl overflow-hidden border"
    : "relative w-full h-36 rounded-xl overflow-hidden border";

  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{hint}</p>}
      {preview ? (
        <div className={boxCls + " border-gray-200 dark:border-gray-700 group"}>
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className={
            (square ? "w-full aspect-square" : "w-full h-36") +
            " rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1.5 hover:border-violet-400 hover:bg-violet-50/30 dark:hover:border-violet-700 dark:hover:bg-violet-950/10 transition"
          }
        >
          <Upload className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          <span className="text-[11px] text-gray-400 dark:text-gray-500">Upload</span>
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} />
        </button>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function ParentSetupPage() {
  const router   = useRouter();
  const { locale, country, category } = useParams();
  const catLabel = CATEGORY_LABELS[category] ?? "Property";

  // Dark mode (same pattern as WizardShell)
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const sync = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // ── Form state ────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    propertyName:   "",
    description:    "",
    builtYear:      "",
    operatingSince: "",
    propertySize:   "",
    sizeUnit:       "Sq Ft",
    contactPerson:  "",
    phone:          "",
    email:          "",
  });
  const [logo, setLogo] = useState(null);

  const [touched,   setTouch]    = useState({});
  const [attempted, setAttempted] = useState(false);
  const [saving,    setSaving]   = useState(false);

  const touch = (f) => setTouch((p) => ({ ...p, [f]: true }));
  const set   = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const showErr = (f) => touched[f] || attempted;

  // ── Validation ────────────────────────────────────────────────────────
  const v = {
    propertyName: form.propertyName.trim().length > 3,
    description:  form.description.trim().length >= 10,
    email:        !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
  };
  const isValid = Object.values(v).every(Boolean);

  // ── Submit ─────────────────────────────────────────────────────────────
  async function handleContinue() {
    setAttempted(true);
    if (!isValid) return;
    setSaving(true);
    try {
      // TODO: await SaveParent({ ...form, logo, cover, category });
      router.push(`/${locale}/${country}/start-listing/${category}/basic-details`);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    router.push(`/${locale}/${country}/vendor/listing`);
  }

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">

      {/* ══════════════════════════════════════════════════════════════
          STICKY HEADER  — exact clone of WizardShell header
      ══════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="w-full px-5 sm:px-10 py-3.5 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href={`/${locale}/${country}/home`} aria-label="VenueBook home"
              className="flex-shrink-0 transition-opacity hover:opacity-75">
              <Image
                src={isDark ? darkLogo : lightLogo}
                alt="VenueBook"
                height={32}
                className="h-7 sm:h-8 w-auto object-contain min-w-[88px]"
                priority
              />
            </Link>

            {/* Category tag — same as WizardShell */}
            <div className="hidden sm:flex flex-1 items-center justify-center">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300">
                {catLabel}
                <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
                <span className="text-gray-400 font-normal">Parent Property Setup</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleBack}
              className="ml-auto flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 cursor-pointer text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30"
            >
              <BookmarkCheck size={15} strokeWidth={2} />
              <span className="hidden sm:inline">Save &amp; Exit</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>

        {/* Thin progress bar — "Step 0" before the main wizard */}
        <div className="w-full h-[3px] bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full"
            style={{ width: "4%", background: "linear-gradient(90deg, #a44bf3, #499ce8)" }}
          />
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          SCROLLABLE CONTENT  — max-w-[720px], identical to WizardShell
      ══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-5 sm:px-8 pt-10 pb-12">

          {/* Page title block */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              Property Information
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Provide information about your overall property.
              Individual units and spaces will be added in the next steps.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >

            {/* ══════════════════════════════════════════════════════
                SECTION 1 — Property Details
            ══════════════════════════════════════════════════════ */}
            <SectionHeading>Property Details</SectionHeading>

            {/* Property name */}
            <div>
              <Label required>Property name</Label>
              <input
                type="text"
                value={form.propertyName}
                onChange={(e) => set("propertyName", e.target.value)}
                onBlur={() => touch("propertyName")}
                maxLength={80}
                placeholder="e.g. Royal Palace Convention Center"
                className={inputCls(showErr("propertyName") && !v.propertyName)}
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-red-500">
                  {showErr("propertyName") && !v.propertyName ? "Minimum 4 characters required" : ""}
                </span>
                <span className="text-xs text-gray-400">{form.propertyName.length}/80</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label required>About this property</Label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                onBlur={() => touch("description")}
                maxLength={600}
                rows={5}
                placeholder="Describe the property — its story, overall offering, and what makes it special…"
                className={[
                  "w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900",
                  "text-gray-900 dark:text-white text-sm outline-none transition resize-none",
                  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                  showErr("description") && !v.description
                    ? "border-red-400 ring-1 ring-red-400"
                    : "border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
                ].join(" ")}
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-red-500">
                  {showErr("description") && !v.description ? "Please add a description (min 10 characters)" : ""}
                </span>
                <span className="text-xs text-gray-400">{form.description.length}/600</span>
              </div>
            </div>

            {/* Built year + Operating since */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Built year</Label>
                <input
                  type="number"
                  value={form.builtYear}
                  onChange={(e) => set("builtYear", e.target.value)}
                  placeholder="e.g. 2008"
                  className={inputCls()}
                />
              </div>
              <div>
                <Label>Operating since</Label>
                <input
                  type="number"
                  value={form.operatingSince}
                  onChange={(e) => set("operatingSince", e.target.value)}
                  placeholder="e.g. 2010"
                  className={inputCls()}
                />
              </div>
            </div>

            {/* Property size — 80/20 split */}
            <div>
              <Label>Property size</Label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={form.propertySize}
                  onChange={(e) => set("propertySize", e.target.value)}
                  placeholder="e.g. 25000"
                  className={inputCls() + " flex-[4]"}
                />
                <select
                  value={form.sizeUnit}
                  onChange={(e) => set("sizeUnit", e.target.value)}
                  className={inputCls() + " flex-[1] cursor-pointer"}
                >
                  {["Sq Ft", "Sq M", "Acres", "Hectares"].map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                SECTION 2 — Business Contact
            ══════════════════════════════════════════════════════ */}
            <SectionHeading>Business Contact</SectionHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Contact person</Label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) => set("contactPerson", e.target.value)}
                  placeholder="Full name"
                  className={inputCls()}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inputCls()}
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={() => touch("email")}
                placeholder="hello@yourproperty.com"
                className={inputCls(showErr("email") && !v.email)}
              />
              {showErr("email") && !v.email && (
                <span className="text-xs text-red-500 mt-1.5 block">Enter a valid email address</span>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════
                SECTION 3 — Branding
            ══════════════════════════════════════════════════════ */}
            <SectionHeading>
              Branding{" "}
              <span className="text-sm font-normal text-gray-400">(optional)</span>
            </SectionHeading>

            {/* Logo — small square uploader, not full-width */}
            <div className="flex items-start gap-6">
              <div className="w-32 shrink-0">
                <ImageUpload
                  label="Property logo"
                  hint="512 × 512 px"
                  file={logo}
                  onChange={setLogo}
                  square
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-8 leading-relaxed">
                Your logo will appear on all unit listings that belong to this property.
                You can update it at any time from your dashboard.
              </p>
            </div>

          </motion.div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          STICKY FOOTER  — exact clone of WizardFooter
      ══════════════════════════════════════════════════════════════ */}
      <div className="sticky bottom-0 z-40 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
        <div className="w-full px-5 sm:px-10 py-4 flex items-center justify-between gap-3">

          <button
            type="button"
            onClick={handleBack}
            className="min-h-[44px] px-6 rounded-xl text-sm font-semibold border flex-shrink-0 inline-flex items-center transition-all duration-150 focus:outline-none border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.97]"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className={[
              "min-h-[44px] px-8 rounded-xl text-sm font-semibold ml-auto flex-shrink-0",
              "inline-flex items-center justify-center gap-2",
              "transition-all duration-150 focus:outline-none",
              "focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
              saving
                ? "opacity-60"
                : "text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-violet-200 dark:shadow-violet-950/50",
            ].join(" ")}
            style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}
          >
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
              : "Continue"
            }
          </button>
        </div>
      </div>
    </div>
  );
}
