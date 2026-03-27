"use client";

import { motion } from "framer-motion";

export default function PremiumButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = "primary",
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      className={`
        relative overflow-hidden px-6 py-3 rounded-xl font-medium
        transition-all duration-300
        ${variantStyles[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {/* Glow Effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition duration-500" />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && <Loader />}
        {loading ? "Processing..." : children}
      </span>

      {/* Shimmer Loading */}
      {loading && (
        <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      )}
    </motion.button>
  );
}

const variantStyles = {
  primary: `
    bg-gradient-to-r from-blue-600 to-indigo-600
    text-white shadow-lg shadow-blue-500/30
    hover:shadow-blue-500/50
  `,
  secondary: `
    bg-white/30 backdrop-blur-xl border border-white/20
    text-gray-800 shadow-md
    hover:bg-white/40
  `,
};


function Loader() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );
}

