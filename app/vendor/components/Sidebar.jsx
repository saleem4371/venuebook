"use client";

import { motion } from "framer-motion";
import { Home, Users, Settings } from "lucide-react";

export default function Sidebar({ open, setOpen }) {
  return (
    <motion.div
      animate={{ width: open ? 240 : 80 }}
      className="bg-white dark:bg-gray-800 shadow-lg h-full p-4"
    >
      <button
        onClick={() => setOpen(!open)}
        className="mb-6 text-sm text-gray-500"
      >
        ☰
      </button>

      <nav className="space-y-4">
        <MenuItem icon={<Home />} label="Dashboard" open={open} />
        <MenuItem icon={<Users />} label="Users" open={open} />
        <MenuItem icon={<Settings />} label="Settings" open={open} />
      </nav>
    </motion.div>
  );
}

function MenuItem({ icon, label, open }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition">
      {icon}
      {open && <span>{label}</span>}
    </div>
  );
}