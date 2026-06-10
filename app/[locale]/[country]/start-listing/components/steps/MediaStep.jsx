"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  ImagePlus, X, Star, ChevronLeft, ChevronRight, AlertCircle,
  MoreVertical, Trash2, GripVertical,
} from "lucide-react";
import { saveBlob, deleteBlob } from "../imageStore";

// ─── Mobile bottom action sheet ───────────────────────────────────────────
//  Rendered only on <md (768 px). Slides up from the bottom with photo actions.
//  Backdrop click dismisses the sheet.

function MobileActionSheet({ img, onSetCover, onDelete, onClose }) {
  // Lock body scroll while sheet is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 md:hidden flex items-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl overflow-hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-center py-3 border-b border-gray-100 dark:border-gray-800">
          Photo Actions
        </p>

        {/* Actions */}
        <div className="p-3 space-y-1">
          {!img.cover && (
            <button
              type="button"
              onClick={onSetCover}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-800"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                <Star size={17} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Set as Cover</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">First image guests see</p>
              </div>
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left transition-colors hover:bg-red-50 dark:hover:bg-red-950/20 active:bg-red-100 dark:active:bg-red-950/30"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
              <Trash2 size={17} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Delete Photo</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Remove from your listing</p>
            </div>
          </button>
        </div>

        {/* Cancel */}
        <div className="px-3 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Upload progress overlay ───────────────────────────────────────────────

function ProgressOverlay({ pct }) {
  if (pct >= 100) return null;
  return (
    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 pointer-events-none z-10">
      <div className="w-3/4 h-1.5 rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-white text-[10px] font-semibold tabular-nums">{pct}%</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MediaStep — drag-to-reorder, duplicate prevention, upload progress, cover
//  Images are persisted via IndexedDB (imageStore.js) so they survive refresh.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_PHOTOS  = 15;
const VALID_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function MediaStep({ form, updateForm, attempted }) {
  const images    = form.images || [];
  const inputRef  = useRef(null);
  const showError = attempted?.media && images.length < 1;
  const category  = form.category || "uncategorized";

  // { [id]: 0–100 } — upload simulation progress
  const [progress, setProgress] = useState({});

  // Drag-and-drop state
  const dragFrom  = useRef(null);
  const [dragOver, setDragOver] = useState(null);
  const [dropActive, setDropActive] = useState(false); // upload zone highlight

  // Mobile-only state
  const [activeSheet,       setActiveSheet]       = useState(null);  // img.id whose sheet is open
  const [mobileReorderMode, setMobileReorderMode] = useState(false);

  // Long-press detection (500 ms) — enters reorder mode on mobile
  const longPressTimer = useRef(null);
  const handleLongPressStart = useCallback(() => {
    if (mobileReorderMode) return;
    longPressTimer.current = setTimeout(() => {
      setMobileReorderMode(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(40);
    }, 500);
  }, [mobileReorderMode]);
  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);
  // Cleanup timer on unmount
  useEffect(() => () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }, []);

  // ── Simulate upload progress for new images ──
  const simulateUpload = useCallback((id) => {
    let pct = 0;
    const tick = () => {
      pct = Math.min(100, pct + Math.floor(Math.random() * 18) + 6);
      setProgress((prev) => ({ ...prev, [id]: pct }));
      if (pct < 100) setTimeout(tick, 90 + Math.random() * 80);
    };
    setTimeout(tick, 60);
  }, []);

  // Clean up progress state for removed images
  useEffect(() => {
    const ids = new Set(images.map((img) => img.id));
    setProgress((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => { if (ids.has(k)) next[k] = prev[k]; });
      return next;
    });
  }, [images]);

  // ── File ingestion (dedup by name+size, max 10 MB) ──
  const handleFiles = useCallback(async (files) => {
  if (!files?.length) return;

  const existingKeys = new Set(images.map((img) => img.dupKey));
  const remaining = MAX_PHOTOS - images.length;

  const fileList = Array.from(files)
    .filter((f) => {
      if (!VALID_TYPES.includes(f.type)) return false;
      if (f.size > 10 * 1024 * 1024) return false;

      const key = `${f.name}__${f.size}`;

      if (existingKeys.has(key)) return false;

      existingKeys.add(key);

      return true;
    })
    .slice(0, remaining);

  if (!fileList.length) return;

  const incoming = await Promise.all(
    fileList.map(async (file) => {
      const id = `img-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      const localKey = `${category}/${id}`;

      // Save to IndexedDB
      await saveBlob(localKey, file);

      return {
        id,
        localKey,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        dupKey: `${file.name}__${file.size}`,
        cover: false,
        uploaded: false,
      };
    })
  );

  const updated = [...images, ...incoming];

  if (!updated.some((img) => img.cover)) {
    updated[0] = {
      ...updated[0],
      cover: true,
    };
  }

  updateForm({ images: updated });

}, [images, category, updateForm]);

  // ── CRUD helpers ──
  const removeImage = (id) => {
    // Remove blob from IndexedDB
    deleteBlob(`${category}/${id}`).catch(() => {});
    let next = images.filter((img) => img.id !== id);
    if (next.length > 0 && !next.some((img) => img.cover)) {
      next[0] = { ...next[0], cover: true };
    }
    updateForm({ images: next });
  };

  const setCover = (id) =>
    updateForm({ images: images.map((img) => ({ ...img, cover: img.id === id })) });

  // ── Reorder ──
  const moveImage = (from, to) => {
    if (from === to || to < 0 || to >= images.length) return;
    const arr = [...images];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    updateForm({ images: arr });
  };

  // HTML5 DnD
  const onItemDragStart = (i)  => { dragFrom.current = i; };
  const onItemDragEnter = (i)  => setDragOver(i);
  const onItemDragOver  = (e)  => e.preventDefault();
  const onItemDragEnd   = ()   => {
    if (dragFrom.current !== null && dragOver !== null) moveImage(dragFrom.current, dragOver);
    dragFrom.current = null;
    setDragOver(null);
  };

  // Upload-zone DnD
  const onZoneDragOver  = (e) => { e.preventDefault(); setDropActive(true); };
  const onZoneDragLeave = ()  => setDropActive(false);
  const onZoneDrop      = (e) => { e.preventDefault(); setDropActive(false); handleFiles(e.dataTransfer.files); };

  const isUploading = (id) => (progress[id] ?? 100) < 100;

  return (
    <div className="space-y-6">

      {/* ── Drop / click zone — hidden once photos exist ── */}
      {images.length === 0 && (
      <div
        onDrop={onZoneDrop}
        onDragOver={onZoneDragOver}
        onDragLeave={onZoneDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload photos"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={[
          "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed",
          "cursor-pointer transition-all duration-200 py-12 px-6 text-center outline-none",
          "focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
          showError
            ? "border-red-400 bg-red-50/60 dark:bg-red-950/20"
            : dropActive
              ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20"
              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50/30 dark:hover:bg-violet-950/20",
        ].join(" ")}
      >
        <div
          className={[
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
            dropActive ? "bg-violet-100 dark:bg-violet-900/40" : "bg-gray-100 dark:bg-gray-800",
          ].join(" ")}
        >
          <ImagePlus
            size={26}
            className={
              showError
                ? "text-red-400"
                : dropActive
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-gray-400 dark:text-gray-500"
            }
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {dropActive
              ? "Release to upload"
              : <>Drop photos here or{" "}<span className="text-violet-600 dark:text-violet-400 underline underline-offset-2">browse files</span></>
            }
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            JPG, PNG, WEBP · Max 10 MB per photo · Up to {MAX_PHOTOS} photos
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        />
      </div>
      )}

      {/* Hidden file input — always rendered; triggers both dropzone and Add Photos button */}
      {images.length > 0 && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        />
      )}

      {showError && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 -mt-2">
          <AlertCircle size={12} />
          Please upload at least 1 photo
        </p>
      )}

      {/* ── Photo grid ── */}
      {images.length > 0 && (
        <div>

          {/* Counter bar */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {images.length} / {MAX_PHOTOS} photos
              {images.length < 5 && (
                <span className="ml-1.5 text-violet-500 normal-case tracking-normal font-normal hidden sm:inline">
                  — add {5 - images.length} more for best results
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <p className="hidden md:block text-[11px] text-gray-400 dark:text-gray-500">
                Drag to reorder
              </p>
              {images.length < MAX_PHOTOS && (
                <>
                  {/* Desktop: subtle text link */}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                  >
                    <ImagePlus size={12} />
                    Add photos
                  </button>
                  {/* Mobile: filled pill button — always discoverable */}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  >
                    <ImagePlus size={12} />
                    Add Photos
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile: reorder mode banner */}
          {mobileReorderMode && (
            <div className="md:hidden mb-3 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-800">
              <p className="flex items-center gap-2 text-xs font-medium text-violet-700 dark:text-violet-300">
                <GripVertical size={13} />
                Tap ‹ › on a photo to reorder
              </p>
              <button
                type="button"
                onClick={() => setMobileReorderMode(false)}
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Grid — tighter gap on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
            {images.map((img, i) => {
              const uploading     = isUploading(img.id);
              const pct           = progress[img.id] ?? 100;
              const isDraggedOver = dragOver === i && dragFrom.current !== i;

              return (
                <div
                  key={img.id}
                  draggable={!uploading}
                  onDragStart={() => onItemDragStart(i)}
                  onDragEnter={() => onItemDragEnter(i)}
                  onDragOver={onItemDragOver}
                  onDragEnd={onItemDragEnd}
                  onTouchStart={handleLongPressStart}
                  onTouchEnd={handleLongPressEnd}
                  onTouchCancel={handleLongPressEnd}
                  className={[
                    "relative group aspect-square rounded-xl overflow-hidden",
                    "bg-gray-100 dark:bg-gray-800 select-none transition-all duration-150",
                    !uploading && !mobileReorderMode && "md:cursor-grab md:active:cursor-grabbing",
                    isDraggedOver ? "ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-gray-950 scale-[0.96]" : "",
                  ].join(" ")}
                >
                  {/* Photo */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.name}
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none"
                  />

                  {/* Upload progress */}
                  <ProgressOverlay pct={pct} />

                  {/* Cover badge — z-30 so it stays visible above overlays */}
                  {img.cover && !uploading && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full pointer-events-none z-30">
                      <Star size={8} fill="white" className="flex-shrink-0" />
                      Cover
                    </div>
                  )}

                  {/* ── Mobile: 3-dot menu button (always visible, not in reorder mode) ── */}
                  {!mobileReorderMode && !uploading && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveSheet(img.id); }}
                      aria-label="Photo options"
                      className="md:hidden absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center transition-colors active:bg-black/75"
                    >
                      <MoreVertical size={14} className="text-white" />
                    </button>
                  )}

                  {/* ── Mobile: reorder mode overlay ── */}
                  {mobileReorderMode && !uploading && (
                    <div className="md:hidden absolute inset-0 z-20 bg-black/30 flex flex-col items-center justify-between p-2">
                      {/* Drag handle badge */}
                      <div className="self-start w-7 h-7 bg-black/60 rounded-lg flex items-center justify-center">
                        <GripVertical size={14} className="text-white" />
                      </div>
                      {/* Arrow reorder buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={(e) => { e.stopPropagation(); moveImage(i, i - 1); }}
                          className="w-8 h-8 bg-black/60 rounded-lg flex items-center justify-center disabled:opacity-25 text-white transition-colors active:bg-black/80"
                          aria-label="Move earlier"
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <span className="text-white/70 text-[11px] font-semibold tabular-nums w-5 text-center">
                          {i + 1}
                        </span>
                        <button
                          type="button"
                          disabled={i === images.length - 1}
                          onClick={(e) => { e.stopPropagation(); moveImage(i, i + 1); }}
                          className="w-8 h-8 bg-black/60 rounded-lg flex items-center justify-center disabled:opacity-25 text-white transition-colors active:bg-black/80"
                          aria-label="Move later"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Desktop: hover overlay (unchanged) ── */}
                  {!uploading && (
                    <div className="hidden md:flex absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex-col items-center justify-center gap-2">
                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {!img.cover && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCover(img.id); }}
                            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium px-2 py-1.5 rounded-lg transition-colors"
                          >
                            <Star size={10} />
                            Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                          className="bg-red-500/80 hover:bg-red-500 text-white rounded-lg p-1.5 transition-colors"
                          aria-label="Remove photo"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {/* Arrow reorder */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={(e) => { e.stopPropagation(); moveImage(i, i - 1); }}
                          className="bg-white/15 hover:bg-white/25 disabled:opacity-25 text-white rounded-md p-1 transition-colors"
                          aria-label="Move photo earlier"
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <span className="text-white/60 text-[10px] font-medium tabular-nums w-5 text-center">
                          {i + 1}
                        </span>
                        <button
                          type="button"
                          disabled={i === images.length - 1}
                          onClick={(e) => { e.stopPropagation(); moveImage(i, i + 1); }}
                          className="bg-white/15 hover:bg-white/25 disabled:opacity-25 text-white rounded-md p-1 transition-colors"
                          aria-label="Move photo later"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile: long-press hint (only when not in reorder mode) */}
          {!mobileReorderMode && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 md:hidden text-center">
              Long press any photo to reorder · tap ⋮ for options
            </p>
          )}
        </div>
      )}

      {/* ── Mobile bottom action sheet ── */}
      {activeSheet && (() => {
        const sheetImg = images.find((img) => img.id === activeSheet);
        if (!sheetImg) return null;
        return (
          <MobileActionSheet
            img={sheetImg}
            onSetCover={() => { setCover(sheetImg.id); setActiveSheet(null); }}
            onDelete={() => { removeImage(sheetImg.id); setActiveSheet(null); }}
            onClose={() => setActiveSheet(null)}
          />
        );
      })()}

      {/* ── Photo tips ── */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-4 py-3.5">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Tips for great photos
        </p>
        <ul className="space-y-1.5">
          {[
            "Use natural light — shoot during the day",
            "Cover key areas: entrance, main hall, restrooms, outdoor",
            "Horizontal (landscape) orientation looks best",
            "10+ photos increase booking rate by up to 60%",
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-gray-400 dark:text-gray-500">
              <span className="text-violet-400 flex-shrink-0 mt-0.5 leading-none">·</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}