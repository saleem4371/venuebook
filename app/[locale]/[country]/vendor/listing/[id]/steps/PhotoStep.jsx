"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Image as ImageIcon, X, Plus,
  Check, Camera, Film, Layers, AlertCircle,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   PREMIUM PHOTO STEP
   Tabs: Thumbnail → Banner → Category Gallery
   Counts images toward the 5-minimum requirement
───────────────────────────────────────────────────────────────────────────── */
export default function PhotoStep({ form, setForm }) {
  const [tab, setTab] = useState("thumbnail");
  const [newCategory, setNewCategory] = useState("");

  const categories = form.categories || [];

  /* Totals */
  const totalImages =
    (form.thumbnail ? 1 : 0) +
    (form.banner ? 1 : 0) +
    categories.reduce((acc, c) => acc + (c.images?.length || 0), 0);

  const isMinReached = totalImages >= 5;

  /* Add gallery category */
  const addCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    setForm({
      ...form,
      categories: [
        ...categories,
        { id: Date.now().toString(), name, description: "", images: [] },
      ],
    });
    setNewCategory("");
  };

  /* Remove gallery category */
  const removeCategory = (id) => {
    setForm({ ...form, categories: categories.filter((c) => c.id !== id) });
  };

  /* Add images to gallery category */
  const addImagesToCategory = (catId, files) => {
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setForm({
      ...form,
      categories: categories.map((c) =>
        c.id === catId ? { ...c, images: [...(c.images || []), ...urls] } : c
      ),
    });
  };

  /* Remove image from gallery category */
  const removeImageFromCategory = (catId, imgIdx) => {
    setForm({
      ...form,
      categories: categories.map((c) =>
        c.id === catId
          ? { ...c, images: c.images.filter((_, i) => i !== imgIdx) }
          : c
      ),
    });
  };

  const TABS = [
    { key: "thumbnail", label: "Thumbnail", icon: Camera, done: !!form.thumbnail },
    { key: "banner",    label: "Banner",    icon: Film,   done: !!form.banner    },
    { key: "gallery",   label: "Gallery",   icon: Layers, done: categories.length > 0 && categories.every((c) => c.images?.length > 0) },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-[24px] font-bold text-gray-900 dark:text-white leading-tight">Photo Tour</h1>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
          Great photos dramatically increase bookings. Upload at least 5 images to continue.
        </p>
      </div>

      {/* ── Image count badge ── */}
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border
        ${isMinReached
          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
          : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
        }
      `}>
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center shrink-0
          ${isMinReached ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-amber-100 dark:bg-amber-500/20"}
        `}>
          {isMinReached
            ? <Check size={15} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400" />
            : <AlertCircle size={15} className="text-amber-500" />
          }
        </div>
        <div>
          <p className={`text-[13px] font-semibold ${isMinReached ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
            {totalImages} of 5 images uploaded
          </p>
          <p className={`text-[11px] ${isMinReached ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"}`}>
            {isMinReached ? "Minimum reached — you can add more!" : `${5 - totalImages} more needed to proceed`}
          </p>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex bg-gray-100 dark:bg-white/[0.05] rounded-2xl p-1">
        {TABS.map((t) => {
          const isActive = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                text-[12.5px] font-semibold transition-all duration-200 cursor-pointer
                ${isActive
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }
              `}
            >
              <Icon size={13} />
              {t.label}
              {t.done && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
        >
          {tab === "thumbnail" && (
            <SingleImageUpload
              label="Thumbnail"
              description="Primary image shown in search cards. Use a wide, high-quality shot."
              current={form.thumbnail}
              onUpload={(url) => setForm({ ...form, thumbnail: url })}
              onRemove={() => setForm({ ...form, thumbnail: null })}
              aspectHint="Recommended: 16:9"
            />
          )}

          {tab === "banner" && (
            <SingleImageUpload
              label="Banner"
              description="Large header image shown on your listing detail page. Use a landscape hero shot."
              current={form.banner}
              onUpload={(url) => setForm({ ...form, banner: url })}
              onRemove={() => setForm({ ...form, banner: null })}
              aspectHint="Recommended: 3:1 wide"
            />
          )}

          {tab === "gallery" && (
            <div className="space-y-5">

              {/* Existing categories */}
              <AnimatePresence>
                {categories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="
                      bg-gray-50 dark:bg-white/[0.03]
                      border border-gray-200 dark:border-white/[0.07]
                      rounded-2xl overflow-hidden
                    "
                  >
                    {/* Cat header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-violet-500 dark:text-violet-400" />
                        <span className="text-[13px] font-bold text-gray-800 dark:text-white">{cat.name}</span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">{cat.images?.length ?? 0} photos</span>
                      </div>
                      <button
                        onClick={() => removeCategory(cat.id)}
                        className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    </div>

                    {/* Images grid */}
                    <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {(cat.images || []).map((img, imgIdx) => (
                        <div key={imgIdx} className="relative aspect-square rounded-xl overflow-hidden group/img">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImageFromCategory(cat.id, imgIdx)}
                            className="
                              absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm
                              flex items-center justify-center text-white
                              opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer
                            "
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}

                      {/* Add more */}
                      <CategoryImageUpload onUpload={(files) => addImagesToCategory(cat.id, files)} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add new category */}
              <div className="
                flex gap-2 p-4 rounded-2xl
                bg-gray-50 dark:bg-white/[0.03]
                border border-dashed border-gray-200 dark:border-white/[0.08]
              ">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  placeholder="Add gallery section (e.g. Reception Hall, Garden)"
                  className="
                    flex-1 px-4 py-2.5 rounded-xl text-[13px]
                    bg-white dark:bg-white/[0.05]
                    border border-gray-200 dark:border-white/[0.08]
                    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                    focus:outline-none focus:ring-2 focus:ring-violet-500/30
                    transition-all
                  "
                />
                <button
                  onClick={addCategory}
                  className="
                    flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                    text-[13px] font-semibold text-white
                    bg-gradient-to-r from-violet-600 to-indigo-500
                    hover:opacity-90 active:scale-[0.97]
                    transition-all cursor-pointer shrink-0
                  "
                >
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SINGLE IMAGE UPLOAD (Thumbnail / Banner)
───────────────────────────────────────────────────────────────────────────── */
function SingleImageUpload({ label, description, current, onUpload, onRemove, aspectHint }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    onUpload(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">{label}</p>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        {aspectHint && <p className="text-[11px] text-violet-500 dark:text-violet-400 mt-0.5 font-medium">{aspectHint}</p>}
      </div>

      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 group"
          >
            <img src={current} alt={label} className="w-full aspect-video object-cover" />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-white text-gray-900 text-[12px] font-semibold hover:bg-gray-100 transition-all cursor-pointer"
              >
                Replace
              </button>
              <button
                onClick={onRemove}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-[12px] font-semibold hover:bg-red-600 transition-all cursor-pointer"
              >
                Remove
              </button>
            </div>
            {/* Success badge */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm">
                <Check size={10} strokeWidth={3} className="text-white" />
                <span className="text-[10px] font-bold text-white">{label} uploaded</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="
              flex flex-col items-center justify-center gap-4
              aspect-video rounded-2xl border-2 border-dashed cursor-pointer
              border-gray-200 dark:border-white/[0.10]
              bg-gray-50 dark:bg-white/[0.02]
              hover:bg-violet-50/50 dark:hover:bg-violet-500/5
              hover:border-violet-300 dark:hover:border-violet-500/40
              transition-all duration-200 group
            "
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] group-hover:bg-violet-100 dark:group-hover:bg-violet-500/15 flex items-center justify-center transition-colors">
              <Upload size={20} className="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                Drop image here or <span className="text-violet-600 dark:text-violet-400">browse</span>
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, WEBP — Max 10MB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY IMAGE UPLOAD CELL
───────────────────────────────────────────────────────────────────────────── */
function CategoryImageUpload({ onUpload }) {
  const inputRef = useRef(null);

  const handleFiles = (e) => {
    if (e.target.files?.length) onUpload(e.target.files);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="
        aspect-square rounded-xl border-2 border-dashed cursor-pointer
        border-gray-200 dark:border-white/[0.08]
        bg-gray-50 dark:bg-white/[0.02]
        hover:border-violet-400 dark:hover:border-violet-500/50
        hover:bg-violet-50 dark:hover:bg-violet-500/10
        flex flex-col items-center justify-center gap-1
        transition-all duration-200 group
      "
    >
      <Plus size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
      <span className="text-[10px] text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors font-medium">Add</span>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
    </div>
  );
}
