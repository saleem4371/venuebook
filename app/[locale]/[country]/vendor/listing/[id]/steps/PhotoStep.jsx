"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Plus,
  Star,
  Pencil,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Lightbulb,
} from "lucide-react";
import { getCategoryTheme } from "./categoryTheme";

/* ─────────────────────────────────────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tokens(isDark) {
  return {
    panel: isDark ? "#0b1120" : "#ffffff",
    card: isDark ? "#111827" : "#ffffff",
    cardAlt: isDark ? "#0d1526" : "#f8fafc",
    border: isDark
      ? "rgba(255,255,255,0.09)"
      : "rgba(0,0,0,0.08)",
    text: isDark ? "#ffffff" : "#0f172a",
    muted: isDark ? "#94a3b8" : "#64748b",
    dimmed: isDark
      ? "rgba(255,255,255,0.22)"
      : "rgba(0,0,0,0.28)",
    trackBg: isDark
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.05)",
    hoverBg: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
    inputBg: isDark ? "#0d1526" : "#ffffff",
    inputBd: isDark
      ? "rgba(255,255,255,0.10)"
      : "rgba(0,0,0,0.12)",
    shadow: isDark
      ? "0 2px 16px rgba(0,0,0,0.40)"
      : "0 2px 12px rgba(0,0,0,0.07)",
  };
}

const MAX_PHOTOS = 15;
const MIN_PHOTOS = 5;
const MAX_IMAGES_PER_SECTION = 15;

const SUGGESTED_SECTIONS = [
  "Exterior",
  "Interior",
  "Dining Area",
  "Garden",
  "Swimming Pool",
  "Banquet Hall",
  "Parking",
  "Washrooms",
  "Stage / Dance Floor",
  "Bridal Suite",
];

const TIPS = [
  "Use natural light — shoot during the day",
  "Cover key areas: entrance, main hall, restrooms, outdoor",
  "Horizontal (landscape) orientation looks best",
  "10+ photos increase booking rate by up to 60%",
];

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
function getPhotoUrl(photo) {
  if (!photo) return "";
  if (typeof photo === "string") return photo;
  if (photo.url) return photo.url;
  if (photo.images) return photo.images;
  return "";
}

function getSectionImageUrl(img) {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (img.url) return img.url;
  if (img.images) return img.images;
  return "";
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function PhotoStep({
  form,
  setForm,
  category = "venues",
  categorys,
   onDeleteImgeFile = async () => {},
}) {
  const [isDark, setIsDark] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));

    check();

    const obs = new MutationObserver(check);

    obs.observe(document.documentElement, {
      attributeFilter: ["class"],
    });

    return () => obs.disconnect();
  }, []);

  const tk = tokens(isDark);
  const theme = getCategoryTheme(category);

  const addRef = useRef(null);

  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const [tipsOpen, setTipsOpen] = useState(false);

  const photos = form?.photos || [];
  const sections = form?.photoSections || [];

 
  /* ─────────────────────────────────────────────────────────────────────
     MAIN PHOTO ADD
  ───────────────────────────────────────────────────────────────────── */
  const handleAddFiles = (files) => {
    const remaining = MAX_PHOTOS - photos.length;

    if (remaining <= 0) return;

    const newItems = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining)
      .map((f, index) => ({
        id: Date.now() + index,
        file: f,
        url: URL.createObjectURL(f),

        /* COVER IMAGE = category key 2 */
        category_key: photos.length + index === 0 ? 2 : 3,

        /* 2 = cover
           3 = additional images */
        isCover: photos.length + index === 0,
      }));

    setForm((p) => ({
      ...p,
      photos: [...(p.photos || []), ...newItems],
    }));
  };

 async function deleteImageFromServer(image) {
    try {
      if (!image) return;

      const path =
        typeof image === "string"
          ? image
          : image?.path || image?.url || image?.images;

      if (!path) return;

      /* PARENT CALL */
      if (typeof onDeleteImgeFile === "function") {
  await onDeleteImgeFile(image);
}

    } catch (error) {
      console.error("Delete image error:", error);
    }
  }

  /* ─────────────────────────────────────────────────────────────────────
     DRAG REORDER
  ───────────────────────────────────────────────────────────────────── */
  const handleDragStart = (idx) => setDragIdx(idx);

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setOverIdx(idx);
  };

  const handleDrop = async (toIdx) => {
    if (dragIdx === null || dragIdx === toIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }

    const arr = [...photos];

    const [moved] = arr.splice(dragIdx, 1);

    arr.splice(toIdx, 0, moved);

    const normalized = arr.map((item, index) => ({
      ...item,
      category_key: index === 0 ? 2 : 3,
      isCover: index === 0,
    }));

    setForm((p) => ({
      ...p,
      photos: normalized,
    }));

    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  /* ─────────────────────────────────────────────────────────────────────
     SECTION HELPERS
  ───────────────────────────────────────────────────────────────────── */
  const addSection = (name, description = "") => {
    if (!name.trim()) return;

    setForm((p) => ({
      ...p,
      photoSections: [
        ...(p.photoSections || []),

        {
          id: Date.now().toString(),
          name: name.trim(),
          description,
          images: [],
        },
      ],
    }));
  };

  const updateSection = (id, patch) =>
    setForm((p) => ({
      ...p,
      photoSections: (p.photoSections || []).map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    }));

 

  /* ─────────────────────────────────────────────────────────────────────
     SECTION IMAGE ADD
  ───────────────────────────────────────────────────────────────────── */
  const addImagesToSection = (id, files) => {
    const sec = sections.find((s) => s.id === id);

    const current = sec?.images?.length || 0;

    const slots = MAX_IMAGES_PER_SECTION - current;

    if (slots <= 0) return;

    const newItems = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, slots)
      .map((f, index) => ({
        id: Date.now() + index,
        file: f,
        url: URL.createObjectURL(f),

        /* SECTION CATEGORY */
        category_key: 4,
      }));

    updateSection(id, {
      images: [...(sec?.images || []), ...newItems],
    });
  };



  const addedNames = sections.map((s) => s.name.toLowerCase());

  const availableSuggestions = SUGGESTED_SECTIONS.filter(
    (s) => !addedNames.includes(s.toLowerCase())
  );

  
 const handlePageDrop = (e) => {
  e.preventDefault();

  // prevent internal drag reorder from triggering upload
  if (!e.dataTransfer?.files?.length) return;

  handleAddFiles(e.dataTransfer.files);
};

const openConfirm = ({
  type,
  idx,
  sectionId,
  imgIdx,
  title,
  message,
}) => {
  setConfirmData({
    type,
    idx,
    sectionId,
    imgIdx,
    title,
    message,
  });

  setConfirmOpen(true);
};


const handleConfirmDelete = async () => {
  if (!confirmData) return;

  const {
    type,
    idx,
    sectionId,
    imgIdx,
  } = confirmData;

  /* MAIN PHOTO */
  if (type === "main-photo") {
    const image = photos[idx];

    const updated = photos.filter(
      (_, i) => i !== idx
    );

    const normalized = updated.map(
      (item, index) => ({
        ...item,
        category_key:
          index === 0 ? 2 : 3,
        isCover: index === 0,
      })
    );

    setForm((p) => ({
      ...p,
      photos: normalized,
    }));

    /* PARENT API CALL */
    await deleteImageFromServer(image);
  }

  /* SECTION IMAGE */
  if (type === "section-image") {
    const sec = sections.find(
      (s) => s.id === sectionId
    );

    if (sec) {
      const image = sec.images[imgIdx];

      updateSection(sectionId, {
        images: sec.images.filter(
          (_, i) => i !== imgIdx
        ),
      });

      await deleteImageFromServer(image);
    }
  }

  /* SECTION DELETE */
  if (type === "section-delete") {
    const sec = sections.find(
      (s) => s.id === sectionId
    );

    setForm((p) => ({
      ...p,
      photoSections:
        p.photoSections.filter(
          (s) => s.id !== sectionId
        ),
    }));

    if (sec?.images?.length) {
      await Promise.all(
        sec.images.map((img) =>
          deleteImageFromServer(img)
        )
      );
    }

    await fetch(
      "/api/delete-photo-section",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          sectionId,
        }),
      }
    );
  }

  setConfirmOpen(false);
  setConfirmData(null);
};
  const INPUT =
    "w-full rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none transition-all focus:ring-2 focus:ring-violet-500/20";

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2
          className="text-[22px] font-bold leading-tight"
          style={{ color: tk.text }}
        >
          Photos
        </h2>

        <p
          className="text-[13px] mt-1"
          style={{ color: tk.muted }}
        >
          Great photos help your listing stand out.
        </p>
      </div>

      {/* COUNT */}
      <div className="flex items-center justify-between">
        <p
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: tk.dimmed }}
        >
          {photos.length} / {MAX_PHOTOS} Photos

          {photos.length < MIN_PHOTOS && (
            <span
              className="ml-2 normal-case font-semibold"
              style={{ color: "#f59e0b" }}
            >
              — {MIN_PHOTOS - photos.length} more needed
            </span>
          )}
        </p>

        <div className="flex items-center gap-3">
          {photos.length > 1 && (
            <p
              className="text-[11px]"
              style={{ color: tk.dimmed }}
            >
              Drag to reorder
            </p>
          )}

          {photos.length < MAX_PHOTOS && (
            <button
              onClick={() => addRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer"
              style={{
                background: theme.gradient,
                color: "#fff",
              }}
            >
              <Plus size={13} />
              Add photos
            </button>
          )}

          <input
            ref={addRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleAddFiles(e.target.files)}
          />
        </div>
      </div>

      {/* PHOTO GRID */}
      {photos.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handlePageDrop}
          onDragStart={() => handleDragStart(idx)}
        >
          {photos.map((photo, idx) => {
            const src = getPhotoUrl(photo);

            const isCover = idx === 0;

            const isDragging = dragIdx === idx;

            const isTarget =
              overIdx === idx && dragIdx !== idx;

            return (
              <div
                key={photo.id || idx}
                draggable
                onDragOver={(e) => {
  e.stopPropagation();
  handleDragOver(e, idx);
}}
               onDrop={(e) => {
  e.stopPropagation();
  handleDrop(idx);
}}
                onDragEnd={handleDragEnd}
                className="relative group cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: "16/9",
                  background: tk.trackBg,
                  outline: isTarget
                    ? `2px solid ${theme.accent}`
                    : "none",
                  opacity: isDragging ? 0.45 : 1,
                  transition:
                    "opacity 0.15s, outline 0.1s",
                  boxShadow: isCover
                    ? `0 0 0 2.5px ${theme.accent}, ${tk.shadow}`
                    : tk.shadow,
                }}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover"
                />

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: "rgba(0,0,0,0.38)",
                  }}
                />

                {/* REMOVE */}
                <button
                  onClick={() =>
  openConfirm({
    type: "main-photo",
    idx,
    title: "Delete Photo",
    message:
      "Are you sure you want to delete this photo?",
  })
}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                  style={{
                    background: "rgba(0,0,0,0.65)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <X
                    size={10}
                    style={{ color: "#fff" }}
                  />
                </button>

                {/* COVER */}
                {isCover && (
                  <div
                    className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full z-10"
                    style={{
                      background:
                        "rgba(0,0,0,0.72)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <Star
                      size={9}
                      fill="#f59e0b"
                      style={{ color: "#f59e0b" }}
                    />

                    <span
                      className="text-[10px] font-bold"
                      style={{ color: "#fff" }}
                    >
                      Cover
                    </span>
                  </div>
                )}

                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <GripVertical
                    size={14}
                    style={{
                      color:
                        "rgba(255,255,255,0.80)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          onClick={() => addRef.current?.click()}
          onDrop={handlePageDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-5 py-16 rounded-2xl cursor-pointer transition-all"
          style={{
            border: `2px dashed ${tk.border}`,
            background: tk.cardAlt,
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: tk.trackBg }}
          >
            <Upload
              size={26}
              style={{ color: tk.dimmed }}
            />
          </div>

          <div className="text-center">
            <p
              className="text-[14px] font-semibold"
              style={{ color: tk.text }}
            >
              Drop photos here or{" "}
              <span style={{ color: theme.accent }}>
                browse
              </span>
            </p>

            <p
              className="text-[12px] mt-1"
              style={{ color: tk.muted }}
            >
              PNG, JPG, WEBP — up to {MAX_PHOTOS} photos total
            </p>
          </div>
        </div>
      )}

      {/* TIPS */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: `1px solid ${tk.border}`,
          background: tk.cardAlt,
        }}
      >
        <button
          onClick={() => setTipsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 cursor-pointer transition-all"
          style={{ color: tk.text }}
        >
          <div className="flex items-center gap-2">
            <Lightbulb
              size={14}
              style={{ color: "#f59e0b" }}
            />

            <span className="text-[13px] font-semibold">
              Tips for great photos
            </span>
          </div>

          {tipsOpen ? (
            <ChevronUp
              size={14}
              style={{ color: tk.dimmed }}
            />
          ) : (
            <ChevronDown
              size={14}
              style={{ color: tk.dimmed }}
            />
          )}
        </button>

        <AnimatePresence>
          {tipsOpen && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              transition={{ duration: 0.18 }}
              style={{ overflow: "hidden" }}
            >
              <div
                className="px-4 pb-4 space-y-2"
                style={{
                  borderTop: `1px solid ${tk.border}`,
                }}
              >
                {TIPS.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 pt-2"
                  >
                    <span
                      className="mt-0.5 shrink-0 text-[10px]"
                      style={{ color: theme.accent }}
                    >
                      ›
                    </span>

                    <p
                      className="text-[12px]"
                      style={{ color: tk.muted }}
                    >
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PHOTO SECTIONS */}
      <div className="pt-2">
        <div
          className="h-px mb-6"
          style={{ background: tk.border }}
        />

        <div className="mb-4">
          <h3
            className="text-[16px] font-bold"
            style={{ color: tk.text }}
          >
            Photo Sections
          </h3>

          <p
            className="text-[13px] mt-1"
            style={{ color: tk.muted }}
          >
            Organise photos into named areas.
          </p>
        </div>

        <PhotoSectionsPanel
  sections={sections}
  availableSuggestions={
    availableSuggestions
  }
  onAddSection={addSection}
  onUpdateSection={updateSection}
  onAddImages={addImagesToSection}
  openConfirm={openConfirm}
  tk={tk}
  theme={theme}
  INPUT={INPUT}
  categorys={categorys}
/>
      </div>

      <AnimatePresence>
  {confirmOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 10,
        }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-sm rounded-3xl p-5"
        style={{
          background: tk.card,
          border: `1px solid ${tk.border}`,
          boxShadow: tk.shadow,
        }}
      >
        <h3
          className="text-[16px] font-bold"
          style={{ color: tk.text }}
        >
          {confirmData?.title}
        </h3>

        <p
          className="text-[13px] mt-2"
          style={{ color: tk.muted }}
        >
          {confirmData?.message}
        </p>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={() => {
              setConfirmOpen(false);
              setConfirmData(null);
            }}
            className="px-4 py-2 rounded-xl text-[13px] font-medium"
            style={{
              background: tk.trackBg,
              color: tk.muted,
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmDelete}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white"
            style={{
              background:
                "linear-gradient(135deg,#ef4444,#dc2626)",
            }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PHOTO SECTIONS PANEL
───────────────────────────────────────────────────────────────────────────── */

function PhotoSectionsPanel({
  sections,
  availableSuggestions,
  onAddSection,
  onUpdateSection,
  onAddImages,
  openConfirm,
  tk,
  theme,
  INPUT,
  categorys,
}) {
  const [showForm, setShowForm] = useState(false);

  const [newName, setNewName] = useState("");

  const [newDesc, setNewDesc] = useState("");

  const nameRef = useRef(null);

  const handleAdd = () => {
    if (!newName.trim()) return;

    onAddSection(newName.trim(), newDesc.trim());

    setNewName("");
    setNewDesc("");
    setShowForm(false);
  };

  const openForm = (prefill = "") => {
    setNewName(prefill);

    setNewDesc("");

    setShowForm(true);

    setTimeout(() => {
      nameRef.current?.focus();
    }, 80);
  };

  const categoryNames = Object.values(
    categorys?.category || {}
  ).flat();

  const merged = [
    ...categoryNames,
    ...(Array.isArray(availableSuggestions)
      ? availableSuggestions
      : []),
  ].filter(Boolean);

  return (
    <div className="space-y-4">

      {/* QUICK */}
      {availableSuggestions.length > 0 && (
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: tk.dimmed }}
          >
            Quick add
          </p>

          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 20).map((name) => (
              <button
                key={name}
                onClick={() => onAddSection(name)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer"
                style={{
                  background: tk.trackBg,
                  border: `1px solid ${tk.border}`,
                  color: tk.muted,
                }}
              >
                <Plus size={11} />
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FORM */}
      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{ duration: 0.16 }}
            className="rounded-2xl p-4 space-y-3"
            style={{
              background: tk.cardAlt,
              border: `1px solid ${theme.ring}0.28)`,
            }}
          >
            <p
              className="text-[13px] font-bold"
              style={{ color: tk.text }}
            >
              New Photo Section
            </p>

            <input
              ref={nameRef}
              value={newName}
              onChange={(e) =>
                setNewName(e.target.value)
              }
              placeholder="Section name"
              className={INPUT}
              style={{
                background: tk.inputBg,
                border: `1px solid ${tk.inputBd}`,
                color: tk.text,
              }}
            />

            <textarea
              value={newDesc}
              onChange={(e) =>
                setNewDesc(e.target.value)
              }
              placeholder="Description"
              rows={2}
              className={
                INPUT + " resize-none"
              }
              style={{
                background: tk.inputBg,
                border: `1px solid ${tk.inputBd}`,
                color: tk.text,
              }}
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white cursor-pointer"
                style={{
                  background: theme.gradient,
                }}
              >
                <Plus size={12} />
                Add Section
              </button>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="px-4 py-2 rounded-xl text-[12px] font-medium cursor-pointer"
                style={{
                  color: tk.muted,
                  background: tk.trackBg,
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => openForm()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer"
            style={{
              background: tk.trackBg,
              border: `2px dashed ${tk.border}`,
              color: tk.muted,
            }}
          >
            <Plus size={14} />
            Add Custom Section
          </button>
        )}
      </AnimatePresence>

      {/* CARDS */}
      <AnimatePresence>
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            onUpdate={(patch) =>
              onUpdateSection(section.id, patch)
            }
            onRemove={() =>
  openConfirm({
    type: "section-delete",
    sectionId: section.id,
    title: "Delete Section",
    message:
      "Delete this section and all images?",
  })
}
            onAddImages={(files) =>
              onAddImages(section.id, files)
            }
           onRemoveImage={(idx) =>
  openConfirm({
    type: "section-image",
    sectionId: section.id,
    imgIdx: idx,
    title: "Delete Image",
    message:
      "Are you sure you want to delete this image?",
  })
}
            tk={tk}
            theme={theme}
            INPUT={INPUT}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────────────────────────────────────── */

function SectionCard({
  section,
  onUpdate,
  onRemove,
  onAddImages,
  onRemoveImage,
  tk,
  theme,
  INPUT,
}) {
  const inputRef = useRef(null);

  const [open, setOpen] = useState(true);

  const [editing, setEditing] = useState(false);

  const [eName, setEName] = useState(section.name);

  const [eDesc, setEDesc] = useState(
    section.description || ""
  );

  const imageCount =
    section.images?.length || 0;

  const atMax =
    imageCount >= MAX_IMAGES_PER_SECTION;

  const saveEdit = () => {
    if (!eName.trim()) return;

    onUpdate({
      name: eName.trim(),
      description: eDesc.trim(),
    });

    setEditing(false);
  };

  const handleFiles = (e) => {
    if (e.target.files?.length)
      onAddImages(e.target.files);
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        height: 0,
      }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl overflow-hidden"
      style={{
        border: `1px solid ${tk.border}`,
        background: tk.card,
        boxShadow: tk.shadow,
      }}
    >
      {/* HEADER */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          borderBottom: open
            ? `1px solid ${tk.border}`
            : "none",
        }}
      >
        <GripVertical
          size={14}
          style={{ color: tk.dimmed }}
        />

        {editing ? (
          <div className="flex-1 flex flex-col gap-2">
            <input
              value={eName}
              onChange={(e) =>
                setEName(e.target.value)
              }
              className={INPUT}
              style={{
                background: tk.inputBg,
                border: `1px solid ${theme.ring}0.40)`,
                color: tk.text,
              }}
            />

            <textarea
              value={eDesc}
              onChange={(e) =>
                setEDesc(e.target.value)
              }
              rows={2}
              className={
                INPUT + " resize-none"
              }
              style={{
                background: tk.inputBg,
                border: `1px solid ${theme.ring}0.40)`,
                color: tk.text,
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white"
                style={{
                  background: theme.gradient,
                }}
              >
                Save
              </button>

              <button
                onClick={() =>
                  setEditing(false)
                }
                className="px-3 py-1.5 rounded-lg text-[11px]"
                style={{
                  background: tk.trackBg,
                  color: tk.muted,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p
                className="text-[13px] font-bold"
                style={{ color: tk.text }}
              >
                {section.name}
              </p>

              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  background: tk.trackBg,
                  color: tk.muted,
                  border: `1px solid ${tk.border}`,
                }}
              >
                {imageCount}/
                {MAX_IMAGES_PER_SECTION}
              </span>
            </div>

            {section.description && (
              <p
                className="text-[11px] mt-0.5"
                style={{ color: tk.muted }}
              >
                {section.description}
              </p>
            )}
          </div>
        )}

        {!editing && (
          <div className="flex items-center gap-1">
            <IconBtn
              icon={Pencil}
              onClick={() =>
                setEditing(true)
              }
              tk={tk}
            />

            <IconBtn
              icon={Trash2}
              onClick={onRemove}
              tk={tk}
              danger
            />

            <IconBtn
              icon={
                open
                  ? ChevronUp
                  : ChevronDown
              }
              onClick={() =>
                setOpen((v) => !v)
              }
              tk={tk}
            />
          </div>
        )}
      </div>

      {/* BODY */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.18 }}
            style={{ overflow: "hidden" }}
          >
            <div className="p-4 space-y-3">

              {/* GRID */}
              {imageCount > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {section.images.map(
                    (img, idx) => {
                      const src =
                        getSectionImageUrl(
                          img
                        );

                      return (
                        <div
                          key={idx}
                          className="relative group rounded-xl overflow-hidden"
                          style={{
                            aspectRatio:
                              "16/9",
                            background:
                              tk.trackBg,
                          }}
                        >
                          <img
                            src={src}
                            alt=""
                            className="w-full h-full object-cover"
                          />

                          <button
                            onClick={() =>
                              onRemoveImage(
                                idx
                              )
                            }
                            className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{
                              background:
                                "rgba(0,0,0,0.65)",
                            }}
                          >
                            <X
                              size={10}
                              color="#fff"
                            />
                          </button>
                        </div>
                      );
                    }
                  )}

                  {!atMax && (
                    <div
                      onClick={() =>
                        inputRef.current?.click()
                      }
                      className="rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                      style={{
                        aspectRatio: "16/9",
                        border: `2px dashed ${tk.border}`,
                        background:
                          tk.cardAlt,
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            tk.trackBg,
                        }}
                      >
                        <Plus
                          size={16}
                          style={{
                            color:
                              tk.dimmed,
                          }}
                        />
                      </div>

                      <span
                        className="text-[10px] font-medium"
                        style={{
                          color: tk.dimmed,
                        }}
                      >
                        Add
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* EMPTY */}
              {imageCount === 0 && (
                <div
                  onClick={() =>
                    inputRef.current?.click()
                  }
                  className="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl cursor-pointer transition-all"
                  style={{
                    border: `2px dashed ${tk.border}`,
                    background: tk.cardAlt,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{
                      background: tk.trackBg,
                    }}
                  >
                    <Upload
                      size={18}
                      style={{
                        color: tk.dimmed,
                      }}
                    />
                  </div>

                  <div className="text-center">
                    <p
                      className="text-[13px] font-semibold"
                      style={{
                        color: tk.text,
                      }}
                    >
                      Drop images here or{" "}
                      <span
                        style={{
                          color:
                            theme.accent,
                        }}
                      >
                        browse
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFiles}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ICON BUTTON
───────────────────────────────────────────────────────────────────────────── */

function IconBtn({
  icon: Icon,
  onClick,
  tk,
  danger = false,
}) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer"
      style={{
        color: danger
          ? "rgba(239,68,68,0.50)"
          : tk.dimmed,
        background: "transparent",
      }}
    >
      <Icon size={12} />
    </button>
  );
}