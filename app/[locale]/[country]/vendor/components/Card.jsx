"use client";
import { motion } from "framer-motion";

export default function GlassCard({ title, value }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
      className="p-6 rounded-2xl bg-white backdrop-blur-xl border border-gray-200 shadow-md hover:shadow-lg"
    >
      <p className="text-gray-700 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-gray-900 mt-2">{value}</h2>
    </motion.div>
  );
}