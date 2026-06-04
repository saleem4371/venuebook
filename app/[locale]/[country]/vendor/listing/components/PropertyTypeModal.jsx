"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Category-aware content config
   Handles both singular ("venue") and plural ("venues") keys.
─────────────────────────────────────────────────────────────────────────────── */
const CONTENT = {
  venue: {
    single: {
      title:   "Standalone Venue",
      desc:    "Guests book the entire venue for their event.",
      bullets: ["Banquet Hall", "Community Hall", "Outdoor Venue", "Auditorium"],
    },
    multi: {
      title:   "Venue With Multiple Spaces",
      desc:    "One venue containing multiple independently bookable spaces.",
      bullets: ["Ballroom A", "Ballroom B", "Rooftop Lawn", "Conference Hall"],
    },
  },
  farmstay: {
    single: {
      title:   "Standalone Farmstay",
      desc:    "Guests book the entire farmstay property.",
      bullets: ["Entire Farmstay", "Private Farm Retreat"],
    },
    multi: {
      title:   "Farmstay With Multiple Units",
      desc:    "One farmstay with multiple independently bookable units.",
      bullets: ["Cottage A", "Cottage B", "Tree House", "Glamping Tent"],
    },
  },
  studio: {
    single: {
      title:   "Standalone Studio",
      desc:    "Guests book the entire studio space.",
      bullets: ["Photography Studio", "Podcast Studio"],
    },
    multi: {
      title:   "Studio With Multiple Rooms",
      desc:    "One studio complex with multiple independently bookable rooms.",
      bullets: ["Studio A", "Studio B", "Podcast Room", "Editing Suite"],
    },
  },
  workspace: {
    single: {
      title:   "Standalone Workspace",
      desc:    "Guests book the entire workspace or office.",
      bullets: ["Entire Workspace", "Small Office"],
    },
    multi: {
      title:   "Workspace With Multiple Spaces",
      desc:    "One workspace hub with multiple independently bookable areas.",
      bullets: ["Meeting Room", "Private Cabin", "Event Room", "Hot Desk Area"],
    },
  },
  rental: {
    single: {
      title:   "Single Rental Item",
      desc:    "Guests rent one item at a time.",
      bullets: ["Camera", "Speaker", "Generator"],
    },
    multi: {
      title:   "Rental Inventory Business",
      desc:    "Multiple items available for independent rental bookings.",
      bullets: ["Cameras", "Lighting Kits", "Drones", "Audio Equipment"],
    },
  },
  experience: {
    single: {
      title:   "Standalone Experience",
      desc:    "Guests book one curated experience.",
      bullets: ["Cooking Class", "Farm Tour", "Nature Walk"],
    },
    multi: {
      title:   "Experience With Multiple Slots",
      desc:    "Multiple independently bookable sessions under one host.",
      bullets: ["Morning Session", "Evening Session", "Private Group", "Public Batch"],
    },
  },
};

function normCat(cat = "") {
  const s = cat.toLowerCase().replace(/s$/, "");
  return CONTENT[s] ? s : "venue";
}

/* ─────────────────────────────────────────────────────────────────────────────
   SVG: Single Property
   One building  →  one booking unit
   Pure line-art, accent-coloured strokes, no photos.
─────────────────────────────────────────────────────────────────────────────── */
function SingleSVG({ accent }) {
  const fill  = `${accent}0d`; // ~5 % tint
  const fill2 = `${accent}18`; // ~10 % tint
  const sw    = 1.8;

  return (
    <svg
      viewBox="0 0 240 148"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* ── Subtle glow behind building ── */}
      <ellipse cx="120" cy="88" rx="52" ry="38" fill={accent} opacity="0.07" />

      {/* ── Roof ── */}
      <polyline
        points="76,66 120,34 164,66"
        stroke={accent} strokeWidth={sw + 0.2} strokeLinejoin="round" strokeLinecap="round"
      />

      {/* ── Body ── */}
      <rect
        x="80" y="66" width="80" height="64"
        rx="3" stroke={accent} strokeWidth={sw}
        fill={fill}
      />

      {/* ── Windows ── */}
      <rect x="90"  y="78" width="22" height="18" rx="2.5"
        stroke={accent} strokeWidth={1.5} fill={fill2} />
      <rect x="128" y="78" width="22" height="18" rx="2.5"
        stroke={accent} strokeWidth={1.5} fill={fill2} />

      {/* ── Door ── */}
      <rect x="109" y="98" width="22" height="32" rx="2"
        stroke={accent} strokeWidth={1.5} fill={fill2} />
      <circle cx="129" cy="115" r="1.8" fill={accent} opacity="0.6" />

      {/* ── Connector dashes ── */}
      <line x1="120" y1="132" x2="120" y2="140"
        stroke={accent} strokeWidth="1.4" strokeDasharray="3 2.5" strokeLinecap="round" />

      {/* ── Single booking unit pill ── */}
      <rect x="80" y="140" width="80" height="6" rx="3"
        fill={accent} opacity="0.18" />
      <rect x="96" y="139" width="48" height="8" rx="4"
        stroke={accent} strokeWidth="1.4" fill={fill2} />
      {/* dot inside pill */}
      <circle cx="112" cy="143" r="2.2" fill={accent} opacity="0.7" />
      <line x1="117" y1="143" x2="138" y2="143"
        stroke={accent} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SVG: Multiple Units
   Parent building  →  lines  →  3 unit boxes, each independently bookable
─────────────────────────────────────────────────────────────────────────────── */
function MultiSVG({ accent }) {
  const fill   = `${accent}0d`;
  const fill2  = `${accent}18`;
  const sw     = 1.8;
  const connSw = 1.4;

  // Unit positions: left, center, right
  const units = [
    { x: 18,  label: "A" },
    { x: 93,  label: "B" },
    { x: 168, label: "C" },
  ];
  const uw = 54;   // unit width
  const uh = 40;   // unit height
  const uy = 92;   // unit top y
  const branchY = 74; // horizontal branch y

  // parent building (small, at top)
  const px = 96, py = 12, pw = 48, ph = 36;
  const pCx = px + pw / 2; // 120

  return (
    <svg
      viewBox="0 0 240 148"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* ── Parent building ── */}
      {/* Roof */}
      <polyline
        points={`${px - 4},${py + 14} ${pCx},${py} ${px + pw + 4},${py + 14}`}
        stroke={accent} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Body */}
      <rect x={px} y={py + 14} width={pw} height={ph - 14}
        rx="2.5" stroke={accent} strokeWidth={sw} fill={fill} />
      {/* Two tiny windows */}
      <rect x={px + 8}  y={py + 19} width="12" height="10" rx="1.5"
        stroke={accent} strokeWidth="1.3" fill={fill2} />
      <rect x={px + 28} y={py + 19} width="12" height="10" rx="1.5"
        stroke={accent} strokeWidth="1.3" fill={fill2} />

      {/* ── Connector: parent → horizontal branch ── */}
      <line x1={pCx} y1={py + ph} x2={pCx} y2={branchY}
        stroke={accent} strokeWidth={connSw} strokeLinecap="round" />

      {/* ── Horizontal branch ── */}
      <line x1={units[0].x + uw / 2} y1={branchY}
            x2={units[2].x + uw / 2} y2={branchY}
        stroke={accent} strokeWidth={connSw} strokeLinecap="round" />

      {/* ── Vertical drops from branch to each unit ── */}
      {units.map((u) => (
        <line key={u.label}
          x1={u.x + uw / 2} y1={branchY}
          x2={u.x + uw / 2} y2={uy}
          stroke={accent} strokeWidth={connSw} strokeLinecap="round"
        />
      ))}

      {/* ── Unit boxes ── */}
      {units.map((u) => (
        <g key={u.label}>
          {/* Box */}
          <rect x={u.x} y={uy} width={uw} height={uh}
            rx="3" stroke={accent} strokeWidth={sw - 0.2} fill={fill} />
          {/* Window */}
          <rect x={u.x + 9} y={uy + 8} width="14" height="11" rx="2"
            stroke={accent} strokeWidth="1.3" fill={fill2} />
          {/* Door hint */}
          <rect x={u.x + 30} y={uy + 21} width="13" height="19" rx="1.5"
            stroke={accent} strokeWidth="1.2" fill={fill2} />
          {/* Booking dot below unit */}
          <circle cx={u.x + uw / 2} cy={uy + uh + 8} r="3"
            fill={accent} opacity="0.55" />
        </g>
      ))}

      {/* ── Join dots at branch junctions ── */}
      {units.map((u) => (
        <circle key={`jct-${u.label}`}
          cx={u.x + uw / 2} cy={branchY} r="2.5"
          fill={accent} opacity="0.35"
        />
      ))}
      <circle cx={pCx} cy={branchY} r="2.5" fill={accent} opacity="0.35" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PropertyTypeModal
─────────────────────────────────────────────────────────────────────────────── */
export default function PropertyTypeModal({
  open,
  onClose,
  onContinue,
  accentFrom = "#a44bf3",
  accentTo   = "#499ce8",
  category   = "venue",
}) {
  const [selected, setSelected] = useState("single");

  const cat     = normCat(category);
  const content = CONTENT[cat];

  useEffect(() => { if (open) setSelected("single"); }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleContinue = useCallback(() => onContinue(selected), [selected, onContinue]);

  const grad = { background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` };

  const cards = [
    { id: "single", SVG: SingleSVG, ...content.single },
    { id: "multi",  SVG: MultiSVG,  ...content.multi  },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ptm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="ptm-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ptm-title"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.97,  y: 8  }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "fixed",
              "bg-white dark:bg-gray-900",
              "shadow-[0_32px_80px_rgba(0,0,0,0.26)]",

              /* ── Mobile: bottom sheet ── */
              "bottom-0 left-0 right-0",
              "rounded-t-2xl",
              "max-h-[85vh] overflow-y-auto overflow-x-hidden",
              "pb-[env(safe-area-inset-bottom)]",

              /* ── Desktop: override ALL mobile positioning ── */
              "sm:bottom-auto",           /* cancel bottom-0 */
              "sm:left-1/2 sm:right-auto",/* cancel left-0 right-0 */
              "sm:top-1/2",
              "sm:-translate-x-1/2 sm:-translate-y-1/2",
              "sm:w-[min(920px,92vw)]",
              "sm:max-h-[92vh]",          /* safety cap for very short screens */
              "sm:overflow-y-auto",
              "sm:overflow-x-hidden",
              "sm:rounded-2xl",
              "sm:pb-0",
            ].join(" ")}
            style={{ zIndex: 9999 }}
          >
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 sm:px-8 sm:pt-7 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2
                  id="ptm-title"
                  className="text-[18px] sm:text-[20px] font-bold text-gray-900 dark:text-white"
                >
                  Tell us about your property
                </h2>
                <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">
                  This helps us set up the right listing structure for your business.
                </p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition -mt-0.5"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Cards ── */}
            <div className="px-4 py-4 sm:px-8 sm:py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {cards.map((card) => {
                  const active = selected === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setSelected(card.id)}
                      className={[
                        "relative w-full text-left rounded-xl border-2 overflow-hidden",
                        "transition-all duration-200 focus:outline-none",
                        active
                          ? "border-transparent"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900",
                      ].join(" ")}
                      style={active ? {
                        borderColor: accentFrom,
                        background:  `${accentFrom}07`,
                        boxShadow:   `0 0 0 1px ${accentFrom}44, 0 8px 28px ${accentFrom}16`,
                      } : {}}
                      aria-pressed={active}
                    >
                      {/* Check badge */}
                      <AnimatePresence>
                        {active && (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 520, damping: 24 }}
                            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10"
                          >
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: accentFrom }} />
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* ── Illustration ── */}
                      {/* Fixed pixel height so it doesn't change with card width on mobile */}
                      <div className="w-full px-3 pt-4 pb-2 sm:px-6 sm:pt-5 sm:pb-3">
                        <div className="w-full h-[90px] sm:h-[130px]">
                          <card.SVG accent={accentFrom} />
                        </div>
                      </div>

                      {/* ── Text ── */}
                      <div className="px-3 pb-4 sm:px-5 sm:pb-5">
                        <div
                          className="w-full h-px mb-3"
                          style={{ background: active ? `${accentFrom}22` : "#f3f4f6" }}
                        />
                        <p className="text-[13px] sm:text-[15px] font-bold text-gray-900 dark:text-white mb-1 leading-snug">
                          {card.title}
                        </p>
                        <p className="text-[11px] sm:text-[12.5px] text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 leading-relaxed">
                          {card.desc}
                        </p>
                        {/* Bullets — always visible, 1 per line on mobile, wrap on desktop */}
                        <ul className="flex flex-col gap-y-1">
                          {card.bullets.map((b) => (
                            <li key={b} className="flex items-center gap-1 text-[10.5px] sm:text-[11.5px] text-gray-400 dark:text-gray-500">
                              <span
                                className="w-1 h-1 rounded-full shrink-0"
                                style={{ background: active ? accentFrom : "#9ca3af" }}
                              />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 sm:gap-3 px-4 py-3 sm:px-8 sm:py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <p className="hidden sm:block text-[12px] text-gray-400 dark:text-gray-500 sm:mr-auto">
                You can always add more units to a property later.
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl text-[13px] font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition"
                  style={grad}
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
