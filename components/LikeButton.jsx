"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

// ─── LIKE BUTTON ───────────────────────────────────────────────────────────
//
// A self-contained like button: fills pink + bounces + bursts into
// particles on like, un-fills on unlike, and floats a "+1"/"-1" next to
// the count as it updates.
//
// Usage:
//   <LikeButton count={12} liked={false} onChange={(liked, count) => ...} />
//
// Fully controlled OR uncontrolled:
//   - Pass `liked`/`count` + `onChange` to control it from a parent (e.g.
//     to persist to a backend).
//   - Omit them and it manages its own state, starting from
//     `initialLiked` / `initialCount`.

const BURST_COLORS = ["#D4537E", "#ED93B1", "#993556"];
const PARTICLE_COUNT = 8;

function Particle({ angle, onDone }) {
  const dist = 24 + Math.random() * 10;
  const size = 4 + Math.random() * 3;
  const x = Math.cos(angle) * dist;
  const y = Math.sin(angle) * dist;
  const color = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];

  return (
    <motion.span
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{ x, y, scale: 0, opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      onAnimationComplete={onDone}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        pointerEvents: "none",
      }}
    />
  );
}

function FloatingDelta({ delta, onDone }) {
  return (
    <motion.span
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: -16, opacity: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      onAnimationComplete={onDone}
      style={{
        position: "absolute",
        left: 0,
        top: -2,
        fontSize: 12,
        fontWeight: 700,
        color: delta > 0 ? "#D4537E" : "#94a3b8",
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      {delta > 0 ? `+${delta}` : delta}
    </motion.span>
  );
}

export default function LikeButton({
  count: countProp,
  liked: likedProp,
  initialCount = 1,
  initialLiked = false,
  onChange,
  size = 22,
  className = "",
}) {
  const isControlled = countProp !== undefined && likedProp !== undefined;

  const [internalLiked, setInternalLiked] = useState(initialLiked);
  const [internalCount, setInternalCount] = useState(initialCount);

  const liked = isControlled ? likedProp : internalLiked;
  const count = isControlled ? countProp : internalCount;

  const [particles, setParticles] = useState([]);
  const [deltas, setDeltas] = useState([]);
  const idRef = useRef(0);

  const spawnBurst = useCallback(() => {
    const batch = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: idRef.current++,
      angle: (i / PARTICLE_COUNT) * Math.PI * 2,
    }));
    setParticles((p) => [...p, ...batch]);
  }, []);

  const removeParticle = useCallback((id) => {
    setParticles((p) => p.filter((x) => x.id !== id));
  }, []);

  const spawnDelta = useCallback((delta) => {
    const id = idRef.current++;
    setDeltas((d) => [...d, { id, delta }]);
  }, []);

  const removeDelta = useCallback((id) => {
    setDeltas((d) => d.filter((x) => x.id !== id));
  }, []);

  const handleClick = () => {
    const nextLiked = !liked;
    const nextCount = count + (nextLiked ? 1 : -1);

    if (!isControlled) {
      setInternalLiked(nextLiked);
      setInternalCount(nextCount);
    }
    onChange?.(nextLiked, nextCount);

    spawnDelta(nextLiked ? 1 : -1);
    if (nextLiked) spawnBurst();
  };

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        background: "var(--surface-2, #fff)",
        border: "1px solid var(--border, #e5e7eb)",
        borderRadius: 12,
        padding: "2px 7px",
      }}
    >
      <motion.button
        type="button"
        aria-label={liked ? "Unlike" : "Like"}
        aria-pressed={liked}
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
        animate={liked ? { scale: [1, 1.35, 0.92, 1] } : { scale: 1 }}
        transition={{ duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          position: "relative",
          width: size + 10,
          height: size + 10,
          border: "none",
          background: "transparent",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          overflow: "visible",
        }}
      >
        <Heart
          size={size}
          fill={liked ? "#D4537E" : "none"}
          color={liked ? "#D4537E" : "#94a3b8"}
          strokeWidth={1.8}
          style={{ transition: "fill .2s, color .2s" }}
        />

        <AnimatePresence>
          {particles.map((p) => (
            <Particle key={p.id} angle={p.angle} onDone={() => removeParticle(p.id)} />
          ))}
        </AnimatePresence>
      </motion.button>

      <span style={{ position: "relative", display: "inline-block" }}>
        <motion.span
          key={count}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary, #0f172a)" }}
        >
          {count}
        </motion.span>

        <AnimatePresence>
          {deltas.map((d) => (
            <FloatingDelta key={d.id} delta={d.delta} onDone={() => removeDelta(d.id)} />
          ))}
        </AnimatePresence>
      </span>
    </div>
  );
}
