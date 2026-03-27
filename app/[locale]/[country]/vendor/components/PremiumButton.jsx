"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function PremiumButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  className = "",
}) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled || loading) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    const newRipple = {
      x: e.clientX - rect.left - size / 2,
      y: e.clientY - rect.top - size / 2,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    if (onClick) onClick(e);

    // remove ripple
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 500);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`cursor-pointer relative overflow-hidden px-5 py-3 rounded-xl 
      transition-all duration-300 flex items-center justify-center gap-2 
      ${
        disabled || loading
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-black text-white hover:bg-gray-900"
      } ${className}`}
    >
      {/* 🔥 RIPPLE */}
      <span className="absolute inset-0 pointer-events-none">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ping"
            style={{
              width: ripple.size,
              height: ripple.size,
              top: ripple.y,
              left: ripple.x,
            }}
          />
        ))}
      </span>

      {/* 🔥 LOADING */}
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}

      {/* TEXT */}
      <span className={loading ? "opacity-70" : ""}>
        {children}
      </span>
    </motion.button>
  );
}
