"use client";

/**
 * ReelViewer — Universal fullscreen immersive reel viewer.
 *
 * Mounted once in ClientLayout. Reads from ReelViewerContext.
 * Any page opens it via:  openViewer({ venues, startIndex, category, ... })
 *
 * Features:
 *  - Full screen, z-[300] — above header, navbar, bottom nav, everything
 *  - CSS snap-scroll between reels (same feel as mobile TikTok/Shorts)
 *  - Virtual rendering: only current ±1 reels mounted
 *  - Top-left:  Back + category badge + property name + location
 *  - Top-right: Wishlist / Compare / Share / Mute
 *  - Bottom:    Tags · Rating · Price + "View Property" CTA + counter
 *  - Progress bar (video time-based)
 *  - "Up Next" preview when video is 85%+ complete
 *  - Keyboard: ESC close, ↑↓ ←→ navigate, Space tap-to-pause, M mute
 *  - Body scroll locked while open
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Heart, GitCompare, Share2, Volume2, VolumeX,
  ChevronRight, Star, MapPin, Play, Pause,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CATEGORY_TINTS } from "@/config/categoryConfig";
import { useReelViewer } from "@/context/ReelViewerContext";

const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL ?? "";

const PRICE_SUFFIX = {
  venues:      "Starting Price",
  farmstays:   "/ Night",
  studios:     "/ Hour",
  rentals:     "/ Day",
  workspaces:  "/ Day",
  experiences: "/ Person",
};

const CATEGORY_LABEL = {
  venues:      "Venue",
  farmstays:   "Farmstay",
  studios:     "Studio",
  rentals:     "Rental",
  workspaces:  "Workspace",
  experiences: "Experience",
};

function formatINR(n) {
  if (!n) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Number(n));
}

function getVenueImages(venue) {
  return (venue.images ?? [])
    .map(i => typeof i === "string"
      ? (i.startsWith("http") ? i : `${BASE_URL}/${i}`)
      : (i?.image || i?.url || ""))
    .filter(Boolean);
}

function getChips(venue, category) {
  const amenities = [
    ...(Array.isArray(venue.amenities) ? venue.amenities : []),
    ...(Array.isArray(venue.tags)      ? venue.tags      : []),
    ...(Array.isArray(venue.features)  ? venue.features  : []),
  ].map(a => (typeof a === "string" ? a : a?.name ?? "").toLowerCase());
  const has = kw => amenities.some(a => a.includes(kw));
  const chips = [];
  if (venue.isEntireProperty || venue.entireProperty) chips.push("Entire Estate");
  if (venue.petFriendly || has("pet"))               chips.push("Pet Friendly");
  if (has("pool") || venue.hasPool)                  chips.push("Private Pool");
  if (has("ac") || has("air condition"))             chips.push("AC");
  if (venue.beachfront || has("beach"))              chips.push("Beachfront");
  if (venue.rooftop || has("rooftop"))               chips.push("Rooftop");
  if (has("bonfire"))                                chips.push("Bonfire");
  if (chips.length === 0) {
    const defaults = {
      farmstays:   ["Farm Experience", "Nature Retreat"],
      venues:      ["Event Ready", "Premium Venue"],
      studios:     ["Professional Setup", "Creative Space"],
      workspaces:  ["Modern Office", "Productivity Space"],
      rentals:     ["Quality Equipment", "Flexible Rental"],
      experiences: ["Guided Experience", "Memorable"],
    };
    chips.push(...(defaults[category] ?? ["Premium Property"]));
  }
  return chips.slice(0, 3);
}

/* ─── Shared button style ────────────────────────────────────────────────── */
const BTN = {
  width: 44, height: 44, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.16)", cursor: "pointer",
  flexShrink: 0, transition: "transform 0.15s ease",
};

/* ─── Single reel slide ─────────────────────────────────────────────────── */
function ReelSlide({ venue, isActive, muted, onProgress }) {
  const videoRef  = useRef(null);
  const iconTimer = useRef(null);
  const [ready,    setReady]    = useState(false);
  const [paused,   setPaused]   = useState(false);
  const [showIcon, setShowIcon] = useState(false);

  const videoUrl = venue.videoUrl || venue.video_url || venue.coverVideo;
  const cover    = getVenueImages(venue)[0];

  /* autoplay / pause */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive && !paused) {
      el.play().catch(e => { if (e.name !== "AbortError") console.warn("[ReelViewer]", e); });
    } else {
      el.pause();
    }
  }, [isActive, paused]);

  /* muted sync */
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  /* reset when venue changes */
  useEffect(() => { setReady(false); setPaused(false); }, [videoUrl]);

  useEffect(() => () => clearTimeout(iconTimer.current), []);

  const handleTap = useCallback(() => {
    setPaused(p => {
      const next = !p;
      setShowIcon(true);
      clearTimeout(iconTimer.current);
      iconTimer.current = setTimeout(() => setShowIcon(false), 900);
      return next;
    });
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    if (el?.duration) onProgress?.(el.currentTime / el.duration);
  }, [onProgress]);

  return (
    <div
      className="absolute inset-0 select-none"
      style={{ cursor: "pointer" }}
      onClick={handleTap}
    >
      {videoUrl ? (
        <>
          {/* Blurred poster while buffering */}
          {!ready && cover && (
            <img
              src={cover}
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "blur(14px)", transform: "scale(1.1)" }}
              draggable={false}
            />
          )}
          <video
            key={videoUrl}
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: ready ? 1 : 0, transition: "opacity 0.4s" }}
            muted playsInline loop
            preload={isActive ? "auto" : "metadata"}
            onCanPlay={() => setReady(true)}
            onLoadedData={() => setReady(true)}
            onTimeUpdate={handleTimeUpdate}
          />
        </>
      ) : cover ? (
        <img
          src={cover}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          alt=""
        />
      ) : (
        <div className="absolute inset-0 bg-gray-900" />
      )}

      {/* Play / Pause icon flash */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 5, opacity: showIcon ? 1 : 0, transition: "opacity 0.22s" }}
      >
        <div style={{ ...BTN, width: 64, height: 64 }}>
          {paused
            ? <Play  size={28} className="text-white ml-0.5" fill="white" />
            : <Pause size={26} className="text-white" fill="white" />
          }
        </div>
      </div>
    </div>
  );
}

/* ─── Root export — reads from context ─────────────────────────────────── */
export default function ReelViewer() {
  const { viewerState, closeViewer } = useReelViewer();

  return (
    <AnimatePresence>
      {viewerState && (
        <ReelViewerInner key="reel-viewer" {...viewerState} onClose={closeViewer} />
      )}
    </AnimatePresence>
  );
}

/* ─── Inner viewer (only mounted when open) ─────────────────────────────── */
function ReelViewerInner({
  venues = [], startIndex = 0, category = "venues",
  locale, country,
  wishlist = [], compares = [],
  onWishlist, onCompare,
  onClose,
}) {
  const router     = useRouter();
  const scrollRef  = useRef(null);

  const [activeIdx, setActiveIdx] = useState(startIndex);
  const [muted,     setMuted]     = useState(true);
  const [progress,  setProgress]  = useState(0);

  const accent = CATEGORY_TINTS[category]?.hex ?? "#7c3aed";

  /* ── body scroll lock ── */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* ── scroll to startIndex on mount (instant, no animation flash) ── */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || startIndex === 0) return;
    const child = el.querySelector(`[data-rv-idx="${startIndex}"]`);
    if (child) child.scrollIntoView({ behavior: "instant", block: "start" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── IntersectionObserver: track active reel ── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !venues.length) return;
    const items = el.querySelectorAll("[data-rv-idx]");
    if (!items.length) return;

    const observer = new IntersectionObserver(
      entries => {
        let best = null, bestRatio = 0;
        entries.forEach(entry => {
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = entry.target;
          }
        });
        if (best && bestRatio >= 0.5) {
          const idx = Number(best.dataset.rvIdx);
          setActiveIdx(idx);
          setProgress(0);
        }
      },
      { root: el, threshold: [0.5, 0.9] },
    );
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [venues.length]);

  /* ── keyboard shortcuts ── */
  useEffect(() => {
    const scrollTo = idx => {
      const el = scrollRef.current;
      const child = el?.querySelector(`[data-rv-idx="${idx}"]`);
      child?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handler = e => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        scrollTo(Math.min(venues.length - 1, activeIdx + 1));
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        scrollTo(Math.max(0, activeIdx - 1));
      }
      if (e.key === "End")  { e.preventDefault(); scrollTo(venues.length - 1); }
      if (e.key === "Home") { e.preventDefault(); scrollTo(0); }
      if (e.key === "m" || e.key === "M") setMuted(m => !m);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, activeIdx, venues.length]);

  const venue    = venues[activeIdx];
  const nextVenue = venues[activeIdx + 1];

  if (!venue) return null;

  const liked    = wishlist.some(w => w.venue_id === venue.childVenueId);
  const compared = compares.some(c => c.childVenueId === venue.childVenueId);
  const price    = venue.minPrice || venue.basePrice || venue.price;
  const rating   = venue.rating   || venue.avgRating || venue.averageRating;
  const chips    = getChips(venue, category);
  const parentName = venue.parentVenueName || venue.parent_venue_name || venue.parentName;
  const location = [venue.city, venue.state].filter(Boolean).join(" · ") || venue.location || "";
  const showUpNext = progress > 0.85 && !!nextVenue;

  const navigateTo = () => {
    router.push(`/${locale}/${country}/search/${category}/${venue.childVenueId}`);
    onClose();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/${locale}/${country}/search/${category}/${venue.childVenueId}`;
    navigator.share?.({ title: venue.title || "VenueBook", url }).catch(() => {
      navigator.clipboard?.writeText(url);
    });
  };

  return (
    <motion.div
      className="fixed inset-0 select-none"
      style={{ zIndex: 300, background: "#000" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* ── SNAP-SCROLL FEED ── */}
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-y-scroll"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {venues.map((v, idx) => {
          const inWindow = Math.abs(idx - activeIdx) <= 1;
          return (
            <div
              key={v.childVenueId ?? idx}
              data-rv-idx={idx}
              style={{
                height: "100dvh",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {inWindow ? (
                <ReelSlide
                  venue={v}
                  isActive={idx === activeIdx}
                  muted={muted}
                  onProgress={idx === activeIdx ? setProgress : undefined}
                />
              ) : (
                /* Lightweight placeholder — preload thumbnail only */
                <div className="absolute inset-0 bg-gray-950">
                  {getVenueImages(v)[0] && (
                    <img
                      src={getVenueImages(v)[0]}
                      className="w-full h-full object-cover opacity-30"
                      loading="lazy"
                      alt=""
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── TOP GRADIENT ── */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          zIndex: 10, height: 220,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 65%, transparent 100%)",
        }}
      />

      {/* ── BOTTOM GRADIENT ── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          zIndex: 10, height: "68%",
          background: "linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.55) 48%, transparent 100%)",
        }}
      />

      {/* ── TOP-LEFT: Back + Property identity ── */}
      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          zIndex: 20,
          padding: `max(20px, env(safe-area-inset-top, 20px)) 16px 0 max(16px, env(safe-area-inset-left, 16px))`,
        }}
      >
        {/* Back button */}
        <button
          onClick={onClose}
          className="mb-4 pointer-events-auto flex items-center gap-2 hover:opacity-80 active:scale-95 transition-all"
          style={{ ...BTN, width: "auto", borderRadius: 999, paddingLeft: 14, paddingRight: 16 }}
          aria-label="Close viewer"
        >
          <ArrowLeft size={16} className="text-white" strokeWidth={2.5} />
          <span className="text-[13px] font-semibold text-white">Back</span>
        </button>

        {/* Category badge */}
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-white mb-2"
          style={{ background: accent + "cc", border: `1px solid ${accent}55` }}
        >
          {CATEGORY_LABEL[category] ?? category}
        </span>

        {/* Property name */}
        <p
          className="text-[18px] font-bold text-white leading-tight drop-shadow-md"
          style={{ maxWidth: 260, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
        >
          {venue.title || venue.name || "Property"}
        </p>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1 mt-1.5">
            <MapPin size={11} className="text-white/60 flex-shrink-0" />
            <span className="text-[12px] text-white/65 leading-tight">{location}</span>
          </div>
        )}
      </div>

      {/* ── TOP-RIGHT: Actions ── */}
      <div
        className="absolute top-0 right-0 flex flex-col gap-2.5 pointer-events-auto"
        style={{
          zIndex: 20,
          padding: `max(20px, env(safe-area-inset-top, 20px)) max(16px, env(safe-area-inset-right, 16px)) 0 0`,
        }}
      >
        <button
          onClick={() => onWishlist?.(venue)}
          style={BTN}
          className="hover:scale-110 active:scale-90 transition-transform"
          aria-label={liked ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart
            size={17} strokeWidth={2}
            className={liked ? "fill-red-500 text-red-500" : "text-white"}
          />
        </button>
        <button
          onClick={() => onCompare?.(venue, !compared)}
          style={{ ...BTN, background: compared ? accent + "cc" : "rgba(0,0,0,0.55)" }}
          className="hover:scale-110 active:scale-90 transition-transform"
          aria-label={compared ? "Remove from Compare" : "Add to Compare"}
        >
          <GitCompare size={17} strokeWidth={2} className="text-white" />
        </button>
        <button
          onClick={handleShare}
          style={BTN}
          className="hover:scale-110 active:scale-90 transition-transform"
          aria-label="Share"
        >
          <Share2 size={16} strokeWidth={2} className="text-white" />
        </button>
        <button
          onClick={() => setMuted(m => !m)}
          style={BTN}
          className="hover:scale-110 active:scale-90 transition-transform"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted
            ? <VolumeX size={16} strokeWidth={2} className="text-white/65" />
            : <Volume2 size={16} strokeWidth={2} className="text-white" />
          }
        </button>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{ zIndex: 25, bottom: 0, height: 2.5 }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(progress, 1) * 100}%`,
            background: accent,
            transition: "width 0.5s linear",
            boxShadow: `0 0 6px ${accent}`,
          }}
        />
      </div>

      {/* ── BOTTOM CONTENT ── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          zIndex: 20,
          padding: `24px max(16px, env(safe-area-inset-right, 16px)) max(28px, calc(env(safe-area-inset-bottom, 0px) + 28px)) max(16px, env(safe-area-inset-left, 16px))`,
        }}
      >
        <div className="flex items-end gap-3">

          {/* Left: property details + CTA */}
          <div className="flex-1 min-w-0">

            {/* Chips */}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {chips.map(c => (
                  <span
                    key={c}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold text-white"
                    style={{ background: "rgba(255,255,255,0.16)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.22)" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* Parent property */}
            {parentName && (
              <p className="text-[11px] text-white/55 font-medium mb-1.5">{parentName}</p>
            )}

            {/* Rating + Price */}
            <div className="flex items-center gap-3 mb-4">
              {rating && (
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-[13px] font-bold text-white">{Number(rating).toFixed(1)}</span>
                </div>
              )}
              {price && (
                <div>
                  <span className="text-[15px] font-bold text-white">{formatINR(price)}</span>
                  <span className="text-white/50 text-[10px] ml-1">{PRICE_SUFFIX[category]}</span>
                </div>
              )}
            </div>

            {/* Primary CTA */}
            <button
              onClick={navigateTo}
              className="pointer-events-auto flex items-center gap-2 h-12 px-6 rounded-2xl text-[14px] font-bold text-white transition-all active:scale-[0.97] hover:opacity-95"
              style={{
                background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
                boxShadow: `0 6px 22px ${accent}60`,
              }}
            >
              View Property
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Right: counter */}
          <div className="flex-shrink-0 pb-1">
            <span className="text-[11px] font-semibold text-white/35 tabular-nums">
              {activeIdx + 1} / {venues.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── UP NEXT PREVIEW ── */}
      <AnimatePresence>
        {showUpNext && (
          <motion.div
            key="up-next"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.24 }}
            className="absolute pointer-events-none"
            style={{
              zIndex: 22,
              right: "max(16px, env(safe-area-inset-right, 16px))",
              bottom: "calc(max(28px, env(safe-area-inset-bottom, 28px)) + 140px)",
            }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                width: 158,
                background: "rgba(10,10,10,0.82)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-3 pt-2.5 pb-1.5">
                Up Next
              </p>
              {/* Thumbnail */}
              {(() => {
                const img = getVenueImages(nextVenue)[0];
                return img
                  ? <img src={img} className="w-full object-cover" style={{ height: 82 }} alt="" loading="lazy" />
                  : <div className="w-full bg-gray-800" style={{ height: 82 }} />;
              })()}
              <div className="px-3 py-2.5">
                <p className="text-[12px] font-bold text-white truncate leading-tight">
                  {nextVenue.title || nextVenue.name || "Property"}
                </p>
                <p className="text-[10px] text-white/50 truncate mt-0.5 leading-tight">
                  {nextVenue.parentVenueName || nextVenue.parent_venue_name || nextVenue.parentName || ""}
                </p>
                {(nextVenue.minPrice || nextVenue.basePrice || nextVenue.price) && (
                  <p className="text-[12px] font-bold text-white mt-1.5">
                    {formatINR(nextVenue.minPrice || nextVenue.basePrice || nextVenue.price)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
