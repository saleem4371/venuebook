"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function Blobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div
        animate={{ x: [0, 18, 0], y: [0, -14, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-200/50 dark:bg-violet-900/25 blur-[110px]"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 16, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full bg-purple-200/40 dark:bg-purple-900/20 blur-[130px]"
      />
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full bg-indigo-100/40 dark:bg-indigo-900/10 blur-[90px]"
      />
    </div>
  );
}

function GhostedCode() {
  return (
    <motion.span
      animate={{ opacity: [0.03, 0.055, 0.03] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="fixed select-none pointer-events-none inset-0 flex items-center justify-center font-black text-[clamp(220px,35vw,480px)] leading-none text-purple-950 dark:text-purple-100 blur-[2px]"
      aria-hidden="true"
    >
      401
    </motion.span>
  );
}

function LockIcon() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="relative flex items-center justify-center"
    >
      <motion.div
        animate={{ opacity: [0.4, 0.75, 0.4], scale: [1, 1.12, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-24 h-24 rounded-full bg-violet-400/30 dark:bg-violet-500/30 blur-2xl"
      />
      <svg
        width="88"
        height="88"
        viewBox="0 0 88 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <motion.path
          d="M28 40V28C28 17.507 35.507 10 46 10s18 7.507 18 18v12"
          stroke="url(#sg)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <motion.rect
          x="18" y="38" width="56" height="40" rx="12"
          fill="url(#bg2)"
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
        />
        <motion.circle
          cx="46" cy="56" r="6"
          fill="white" fillOpacity="0.85"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.35 }}
        />
        <motion.rect
          x="43" y="56" width="6" height="9" rx="3"
          fill="white" fillOpacity="0.85"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.35 }}
        />
        <motion.ellipse
          cx="32" cy="48" rx="4.5" ry="2.5"
          fill="white" fillOpacity="0.15"
          transform="rotate(-18 32 48)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
        />
        <defs>
          <linearGradient id="sg" x1="28" y1="10" x2="64" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c4b5fd" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="bg2" x1="18" y1="38" x2="74" y2="78" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#4338ca" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

export default function UnauthorizedClient({ t }) {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_#ede9fe_0%,_#faf5ff_30%,_#ffffff_60%,_#f5f3ff_100%)] dark:bg-[radial-gradient(ellipse_at_top_left,_#1e1030_0%,_#0f0a1e_40%,_#09090b_100%)] px-6 py-20">

      <Blobs />
      <GhostedCode />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-10"
        >
          <LockIcon />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-violet-100/80 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/50 mb-7 backdrop-blur-sm"
        >
          <span aria-hidden="true">🔒</span>
          {t.badge}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.55, ease: "easeOut" }}
          className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-5"
        >
          {t.heading}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46, duration: 0.55, ease: "easeOut" }}
          className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-[440px]"
        >
          {t.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
          className="mt-10"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
          >
            {t.return_home}
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
