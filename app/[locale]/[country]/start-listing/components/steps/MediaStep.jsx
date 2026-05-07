"use client";

import { useRef } from "react";
import { ImagePlus, X, Star } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
//  MediaStep — image upload with preview grid (no backend, preview-only)
// ─────────────────────────────────────────────────────────────────────────────

export default function MediaStep({ form, updateForm, attempted }) {
  const images = form.images || [];
  const inputRef = useRef(null);
  const showError = attempted?.media && images.length < 1;

  const handleFiles = (files) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const newImages = Array.from(files)
      .filter((f) => validTypes.includes(f.type) && f.size <= 10 * 1024 * 1024)
      .map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(file),
        name: file.name,
        cover: false,
      }));

    const updated = [...images, ...newImages].slice(0, 15);

    // Auto-set first image as cover if no cover set
    if (updated.length > 0 && !updated.some((img) => img.cover)) {
      updated[0].cover = true;
    }

    updateForm({ images: updated });
  };

  const removeImage = (id) => {
    let updated = images.filter((img) => img.id !== id);
    if (updated.length > 0 && !updated.some((img) => img.cover)) {
      updated[0] = { ...updated[0], cover: true };
    }
    updateForm({ images: updated });
  };

  const setCover = (id) => {
    updateForm({
      images: images.map((img) => ({ ...img, cover: img.id === id })),
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">

      {/* Upload zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={[
          "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed",
          "cursor-pointer transition-all duration-200 py-12 px-6 text-center",
          showError
            ? "border-red-400 bg-red-50 dark:bg-red-950/20"
            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50/30 dark:hover:bg-violet-950/20",
        ].join(" ")}
      >
        <ImagePlus
          size={36}
          className={showError ? "text-red-400" : "text-gray-300 dark:text-gray-600"}
        />
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Drop photos here or{" "}
            <span className="text-violet-600 dark:text-violet-400 underline underline-offset-2">
              browse
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG, WEBP · Max 10MB per image · Up to 15 photos
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {showError && (
        <p className="text-xs text-red-500">Please upload at least 1 photo</p>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            {images.length} photo{images.length !== 1 ? "s" : ""} added
            {images.length < 5 && (
              <span className="ml-2 text-violet-500 normal-case tracking-normal font-normal">
                — Add {5 - images.length} more for best results
              </span>
            )}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />

                {/* Cover badge */}
                {img.cover && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                    <Star size={9} fill="white" />
                    Cover
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.cover && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCover(img.id); }}
                      className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Star size={10} />
                      Set cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-1.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add more tile */}
            {images.length < 15 && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-violet-400 dark:hover:border-violet-600 transition-colors bg-white dark:bg-gray-900"
              >
                <ImagePlus size={20} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
