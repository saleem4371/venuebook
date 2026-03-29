"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  Calendar,
  CalendarCheck,
  BarChart2,
  MoreHorizontal,
    Package,
  Layers,
  Settings,
  BarChart3
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { useUI } from "@/context/VendorUIContext";

export default function BottomDock() {
  const pathname = usePathname();
  const params = useParams();
 const {  setShowDock, hideBottomMenu } = useUI();
 

  const basePath = `/${params?.locale}/${params?.country}/vendor`;

  const menuItems = [
    { label: "Dashboard", href: `${basePath}/dashboard`, icon: Home },
    { label: "Listing", href: `${basePath}/listing`, icon: Home },
    { label: "Leads", href: `${basePath}/leads`, icon: Users, badge: 12 },
    { label: "Bookings", href: `${basePath}/bookings`, icon: Calendar, badge: 2 },
    { label: "Calendar", href: `${basePath}/calendar`, icon: CalendarCheck },
    { label: "Addons", href: `${basePath}/addons`, icon: Layers },
    { label: "Packages", href: `${basePath}/package`, icon: Package },
    { label: "Settings", href: `${basePath}/settings`, icon:   Settings},
    { label: "Reports", href: `${basePath}/reports`, icon: BarChart3 },
  ];

  const visibleItems = menuItems.slice(0, 4);
  const moreItems = menuItems.slice(4);

  const [showMore, setShowMore] = useState(false);

  // 🔥 SCROLL SMART CONTROL
  const lastScrollY = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (Math.abs(current - lastScrollY.current) < 8) return;

      if (current > lastScrollY.current && current > 80) {
        setShowDock(false);
      } else {
        setShowDock(true);
      }
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setShowDock]);

  // 🔥 ACTIVE PILL
  const itemRefs = useRef([]);
  const [activeStyle, setActiveStyle] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const index = visibleItems.findIndex((i) => i.href === pathname);
    if (index !== -1 && itemRefs.current[index]) {
      const el = itemRefs.current[index];
      requestAnimationFrame(() => {
        setActiveStyle({ left: el.offsetLeft, width: el.offsetWidth });
      });
    }
  }, [pathname]);

  // Hide dock completely if modal or FAB is open
  const isHidden = hideBottomMenu;

  return (
    <motion.div
      initial={{ y: 120, opacity: 0, scale: 0.9 }}
      animate={{
        y: !isHidden ? 0 : 140,
        opacity: !isHidden ? 1 : 0,
        scale: !isHidden ? 1 : 0.92,
      }}
      transition={{ type: "spring", stiffness: 140, damping: 20, mass: 0.7 }}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 md:hidden z-50"
    >
      {/* 🌟 DOCK */}
      <div className="relative flex items-center gap-3 px-5 py-3 border rounded-full backdrop-blur-2xl bg-white/30 border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        {/* ✨ Glow Layer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl"></div>

        {/* 🔥 ACTIVE PILL */}
        <motion.div
          className="absolute top-1 h-12 rounded-full bg-white/80 backdrop-blur-md border border-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
          animate={{ left: activeStyle.left, width: activeStyle.width }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />

        {/* 🔥 VISIBLE ITEMS */}
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setShowMore(false)}
              className="relative flex flex-col items-center z-10 px-2"
              ref={(el) => (itemRefs.current[index] = el)}
            >
              <motion.div
                whileTap={{ scale: 0.75 }}
                whileHover={{ scale: 1.2 }}
                animate={active ? { y: [-2, 0] } : {}}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-2 rounded-full"
              >
                <Icon
                  size={22}
                  className={`transition ${
                    active
                      ? "text-black drop-shadow-[0_0_10px_rgba(0,0,0,0.4)]"
                      : "text-gray-700"
                  }`}
                />
              </motion.div>
              <motion.span
                className="text-[10px] mt-1 font-medium"
                animate={{ opacity: active ? 1 : 0.6, y: active ? -1 : 2 }}
              >
                {item.label}
              </motion.span>
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* 🔥 MORE MENU */}
        {moreItems.length > 0 && (
          <div className="relative z-10">
            <motion.div
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowMore(!showMore)}
              className="flex flex-col items-center cursor-pointer"
            >
              <div className="p-2 rounded-full bg-white/50 backdrop-blur-md">
                <MoreHorizontal size={22} />
              </div>
              <span className="text-[10px] mt-1">More</span>
            </motion.div>

            {/* BACKDROP */}
            <AnimatePresence>
              {showMore && (
                <motion.div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                  onClick={() => setShowMore(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>

            {/* MORE ITEMS MENU */}
            <AnimatePresence>
              {showMore && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 w-52 bg-white/70 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-2 z-50"
                >
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setShowMore(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/60 transition"
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}