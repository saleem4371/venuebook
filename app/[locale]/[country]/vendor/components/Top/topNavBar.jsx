"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import GlobalFAB from "../../components/GlobalFAB";
import { useUI } from "@/context/VendorUIContext";

import {
  Plus,
  Calendar,
  Bookmark,
  Save,
  FileText,
  History,
} from "lucide-react";

export default function TopBar() {
  const params = useParams();
  const pathname = usePathname();
  const basePath = `/${params?.locale}/${params?.country}/vendor`;

  const { isModalOpen } = useUI(); // 🔥 read context to hide FAB when modal open

  const [open, setOpen] = useState(false);

  const actions = [
    { label: "Revenue ", icon: Plus, href: `${basePath}/reports/revenue_report` },
    { label: "Aging", icon: Calendar, href: `${basePath}/reports/aging_report` },
  ];

  // Optional: close FAB when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-indigo-600">
            Reports
          </h1>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-3">
            {actions.map((item, i) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link key={i} href={item.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition
                      ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-white shadow hover:shadow-lg"
                      }`}
                  >
                    <Icon size={18} className={isActive ? "text-white" : "text-indigo-600"} />
                    <span className="text-xs">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      {!isModalOpen && (
        <GlobalFAB actions={actions} open={open} setOpen={setOpen} />
      )}
    </>
  );
}