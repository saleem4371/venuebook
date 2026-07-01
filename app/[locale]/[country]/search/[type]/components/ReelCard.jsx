"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Heart, GitCompare, MapPin, Star, Play, Volume2, VolumeX, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { CATEGORY_TINTS } from "@/config/categoryConfig";
import { getFallbackVideoUrl } from "../data/demoReelVideos";

const BASE_URL = process.env.NEXT_PUBLIC_AWS_BUCKET_URL ?? "";

const PRICE_SUFFIX = {
  venues:      "Starting Price",
  farmstays:   "/ Night",
  studios:     "/ Hour",
  rentals:     "/ Day",
  workspaces:  "/ Day",
  experiences: "/ Person",
};

function formatINR(n) {
  if (!n) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Number(n));
}

function getChips(venue, category) {
  const chips = [];
  const amenities = [
    ...(Array.isArray(venue.amenities) ? venue.amenities : []),
    ...(Array.isArray(venue.tags)      ? venue.tags      : []),
    ...(Array.isArray(venue.features)  ? venue.features  : []),
  ].map(a => (typeof a === "string" ? a : a?.name ?? "").toLowerCase());
  const has = (kw) => amenities.some(a => a.includes(kw));

  if (venue.isEntireProperty || venue.entireProperty) chips.push("Entire Estate");
  if (venue.petFriendly || has("pet"))               chips.push("Pet Friendly");
  if (has("pool") || venue.hasPool)                  chips.push("Private Pool");
  if (has("ac") || has("air condition"))             chips.push("AC Halls");
  if (venue.beachfront || has("beach"))              chips.push("Beachfront");
  if (venue.rooftop || has("rooftop"))               chips.push("Rooftop");
  if (has("bonfire") || has("campfire"))             chips.push("Bonfire");
  if (venue.kidFriendly || has("kid"))               chips.push("Kids Friendly");
  if (has("organic"))                                chips.push("Organic Farm");
  if (has("wifi") || has("wi-fi"))                   chips.push("High-Speed WiFi");
  if (has("parking"))                                chips.push("Free Parking");
  if (has("catering") || has("food"))                chips.push("In-House Catering");
  if (has("conference") || has("projector"))         chips.push("Conference Ready");
  if (has("wedding"))                                chips.push("Wedding Specialist");
  if (has("indoor"))                                 chips.push("Indoor Venue");

  if (chips.length === 0) {
    if (category === "farmstays")   chips.push("Farm Experience", "Nature Retreat");
    if (category === "venues")      chips.push("Event Ready", "Premium Venue");
    if (category === "studios")     chips.push("Professional Setup", "Creative Space");
    if (category === "workspaces")  chips.push("Productivity Space", "Modern Office");
    if (category === "rentals")     chips.push("Quality Equipment", "Flexible Rental");
    if (category === "experiences") chips.push("Guided Experience", "Memorable");
  }
  return chips.slice(0, 4);
}

const BTN = {
  width: 40, height: 40, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(0,0,0,0.52)", backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.14)", cursor: "pointer",
  flexShrink: 0,
};

export default function ReelCard({
  venue, category, locale, country,
  liked, isCompared, onWishlist, onCompare,
  active, compact = false,
  controlledMuted,
  onMuteChange,
}) {
  const router    = useRouter();
  const videoRef  = useRef(null);
  const hideTimer = useRef(null);

  // ── media state ───────────────────────────────────────────────
  const [videoReady, setVideoReady] = useState(false);
  const [imgLoaded,  setImgLoaded]  = useState(false);
  const [paused,     setPaused]     = useState(false);
  // showPauseIcon: briefly visible after tap-to-pause, then auto-hides
  const [showPauseIcon, setShowPauseIcon] = useState(false);

  // ── muted: controlled from parent (lifted) or local ──────────
  const [_muted, _setMuted] = useState(controlledMuted ?? true);
  const muted    = controlledMuted !== undefined ? controlledMuted : _muted;
  const setMuted = useCallback((val) => { _setMuted(val); onMuteChange?.(val); }, [onMuteChange]);

  // ── hover controls (desktop only) ────────────────────────────

  // ── derived ──────────────────────────────────────────────────
  const accent     = CATEGORY_TINTS[category]?.hex ?? "#7c3aed";
  const price      = venue.minPrice || venue.basePrice || venue.price;
  const rating     = venue.rating   || venue.avgRating || venue.averageRating;
  const images     = (venue.images ?? []).map(i =>
    typeof i === "string" ? (i.startsWith("http") ? i : `${BASE_URL}/${i}`)
                          : (i?.image || i?.url || "")
  ).filter(Boolean);
  const cover      = images[0] ?? null;
  const videoUrl   = venue.videoUrl || venue.video_url || venue.coverVideo || null;
  const parentName = venue.parentVenueName || venue.parent_venue_name || venue.parentName;
  const chips      = getChips(venue, category);

  // ── reset ready state on url change ──────────────────────────
  useEffect(() => { setVideoReady(false); setPaused(false); }, [videoUrl]);

  // ── autoplay / pause driven by active prop ────────────────────
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active && !paused) {
      // play() is async; swallow AbortError from rapid reel switching
      el.play().catch((e) => { if (e.name !== "AbortError") console.warn("reel play:", e); });
    } else {
      el.pause();
    }
  }, [active, paused]);

  // ── muted sync ───────────────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  // ── handlers ─────────────────────────────────────────────────
  const navigateToProperty = useCallback(() => {
    router.push(`/${locale}/${country}/search/${category}/${venue.childVenueId}`);
  }, [router, locale, country, category, venue.childVenueId]);

  // Single tap: pause/resume + briefly show pause icon
  const handleReelTap = useCallback((e) => {
    e.stopPropagation();
    setPaused((p) => {
      const next = !p;
      if (next) {
        // became paused — show play icon, auto-hide after 1s
        setShowPauseIcon(true);
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setShowPauseIcon(false), 1000);
      } else {
        setShowPauseIcon(false);
      }
      return next;
    });
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const handleMute    = (e) => { e.stopPropagation(); setMuted(!muted); };
  const handleWishlist = (e) => { e.stopPropagation(); onWishlist?.(venue); };
  const handleCompare  = (e) => { e.stopPropagation(); onCompare?.(venue, !isCompared); };

  // ── video event handlers ──────────────────────────────────────
  const handleCanPlay   = () => setVideoReady(true);
  const handleLoadedData = () => setVideoReady(true); // belt-and-suspenders

  const handleVideoError = useCallback((e) => {
    const el = e.currentTarget;
    const failed = el.src || el.currentSrc;
    const next   = getFallbackVideoUrl(failed);
    console.warn(`[ReelCard] video error, falling back:`, failed, "→", next);
    if (next && next !== failed) {
      el.src = next;
      el.load();
      if (active && !paused) el.play().catch(() => {});
    }
  }, [active, paused]);

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{ backgroundColor: "#111" }}
    >
      {/* ── BACKGROUND ── */}
      {videoUrl ? (
        <>
          {/* Blurred poster while buffering — same image used as thumbnail */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: videoReady ? 0 : 1, pointerEvents: "none", zIndex: 1 }}
          >
            {cover ? (
              <img
                src={cover}
                aria-hidden="true"
                className="w-full h-full object-cover"
                style={{ filter: "blur(14px)", transform: "scale(1.1)" }}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full reel-shimmer" />
            )}
            {/* shimmer sweep */}
            <div className="absolute inset-0 reel-shimmer" style={{ opacity: 0.3 }} />
          </div>

          {/* Actual video */}
          <video
            key={videoUrl}            /* force reload when URL changes */
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: videoReady ? 1 : 0, zIndex: 2 }}
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={handleCanPlay}
            onLoadedData={handleLoadedData}
            onError={handleVideoError}
          />
        </>
      ) : cover ? (
        <img
          src={cover}
          alt={venue.title || venue.name || "Property"}
          className={[
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            active ? "reel-kenburns" : "",
            imgLoaded ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onLoad={() => setImgLoaded(true)}
          style={{ zIndex: 2 }}
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 reel-shimmer" style={{ zIndex: 2 }} />
      )}

      {/* ── GRADIENTS (always above background, below content) ── */}
      <div className="absolute inset-x-0 top-0 h-36 pointer-events-none" style={{ zIndex: 3,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ zIndex: 3, height: "65%",
        background: "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.5) 52%, transparent 100%)" }} />

      {/* ── TAP ZONE (pause/resume) ── */}
      <div className="absolute inset-0 cursor-pointer" style={{ zIndex: 4 }} onClick={handleReelTap} />

      {/* ── PAUSE ICON — only when paused, auto-hides ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300"
        style={{ opacity: showPauseIcon ? 1 : 0, zIndex: 10 }}
      >
        <div style={{ ...BTN, width: 60, height: 60, pointerEvents: "none" }}>
          <Play size={24} className="text-white ml-0.5" fill="white" />
        </div>
      </div>

      {/* ── TOP-LEFT: status badges ── */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none" style={{ zIndex: 8,
        paddingTop: "env(safe-area-inset-top, 0px)" }}>
        {venue.isTrending   && <span className="reel-badge">🔥 Trending</span>}
        {venue.isMostViewed && <span className="reel-badge">👁 Most Viewed</span>}
        {venue.isNew        && <span className="reel-badge">✨ New</span>}
      </div>

      {/* ── TOP-RIGHT: Wishlist + Compare + Mute ── */}
      <div className="absolute top-4 right-4 flex flex-col gap-2.5 pointer-events-auto" style={{ zIndex: 8,
        paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <button onClick={handleWishlist} style={BTN}
          title={liked ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label={liked ? "Remove from Wishlist" : "Add to Wishlist"}
          className="hover:scale-105 active:scale-90 transition-transform">
          <Heart size={16} strokeWidth={2} className={liked ? "fill-red-500 text-red-500" : "text-white"} />
        </button>
        <button onClick={handleCompare} style={{ ...BTN, background: isCompared ? accent + "cc" : "rgba(0,0,0,0.52)" }}
          title={isCompared ? "Remove from Compare" : "Compare Property"}
          aria-label={isCompared ? "Remove from Compare" : "Compare Property"}
          className="hover:scale-105 active:scale-90 transition-transform">
          <GitCompare size={16} strokeWidth={2} className="text-white" />
        </button>
        {/* Mute — always visible when video */}
        {videoUrl && (
          <button onClick={handleMute} style={BTN}
            title={muted ? "Unmute" : "Mute"} aria-label={muted ? "Unmute" : "Mute"}
            className="hover:scale-105 active:scale-90 transition-transform">
            {muted
              ? <VolumeX size={15} strokeWidth={2} className="text-white/70" />
              : <Volume2  size={15} strokeWidth={2} className="text-white" />}
          </button>
        )}
      </div>

      {/* ── BOTTOM CONTENT ── */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ zIndex: 8,
        padding: compact ? "12px" : "20px",
        paddingBottom: compact ? "12px" : "max(20px, env(safe-area-inset-bottom, 20px))" }}>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {chips.map(chip => <span key={chip} className="reel-chip">{chip}</span>)}
          </div>
        )}

        <button onClick={navigateToProperty}
          className={["font-bold text-white leading-tight mb-0.5 text-left pointer-events-auto hover:underline underline-offset-2",
            compact ? "text-[14px]" : "text-[18px]"].join(" ")}>
          {venue.title || venue.name || "Property"}
        </button>

        {parentName && (
          <p className={["text-white/65 font-medium mb-1.5", compact ? "text-[11px]" : "text-[12px]"].join(" ")}>
            {parentName}
          </p>
        )}

        <div className="flex items-center gap-1 mb-2">
          <MapPin size={11} className="text-white/55 flex-shrink-0" />
          <span className={["text-white/55", compact ? "text-[10px]" : "text-[12px]"].join(" ")}>
            {[venue.city, venue.state].filter(Boolean).join(" · ") || venue.location || ""}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          {rating ? (
            <div className="flex items-center gap-1">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-[13px] font-bold text-white">{Number(rating).toFixed(1)}</span>
            </div>
          ) : <div />}
          {price && (
            <div className="text-right">
              <span className={["font-bold text-white", compact ? "text-[13px]" : "text-[15px]"].join(" ")}>
                {formatINR(price)}
              </span>
              <span className="text-white/55 text-[10px] ml-1">{PRICE_SUFFIX[category]}</span>
            </div>
          )}
        </div>

        {(venue.membershipLevel || venue.goldMember || venue.loyaltyBadge) && (
          <div className="mb-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-amber-300"
              style={{ background: "rgba(251,191,36,0.16)", border: "1px solid rgba(251,191,36,0.28)" }}>
              ★ Gold Benefits Available
            </span>
          </div>
        )}

        {/* Primary CTA */}
        <button onClick={navigateToProperty}
          className="pointer-events-auto w-full h-11 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`, boxShadow: `0 4px 16px ${accent}55` }}>
          View Property
          <ChevronRight size={15} strokeWidth={2.5} />
        </button>
      </div>

      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1)    translate(0,0); }
          50%  { transform: scale(1.08) translate(-1%,-1%); }
          100% { transform: scale(1)    translate(0,0); }
        }
        .reel-kenburns { animation: kenBurns 12s ease-in-out infinite; }

        @keyframes reelShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .reel-shimmer {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.03) 25%,
            rgba(255,255,255,0.10) 50%,
            rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: reelShimmer 1.6s ease-in-out infinite;
        }
        .reel-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 99px;
          font-size: 10px; font-weight: 600; color: white;
          background: rgba(0,0,0,0.42); backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .reel-chip {
          display: inline-flex; align-items: center;
          padding: 4px 10px; border-radius: 99px;
          font-size: 10px; font-weight: 600; color: white;
          background: rgba(255,255,255,0.14); backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.18);
        }
      `}</style>
    </div>
  );
}
