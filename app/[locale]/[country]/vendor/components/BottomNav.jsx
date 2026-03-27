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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function BottomDock() {
  const pathname = usePathname();
  const params = useParams();

  const basePath = `/${params?.locale}/${params?.country}/vendor`;

  const menuItems = [
    { label: "Dashboard", href: `${basePath}/dashboard`, icon: Home },
    { label: "Listing", href: `${basePath}/listing`, icon: Home },
    { label: "Leads", href: `${basePath}/leads`, icon: Users, badge: 12 },
    { label: "Bookings", href: `${basePath}/bookings`, icon: Calendar, badge: 2 },
    { label: "Calendar", href: `${basePath}/calendar`, icon: CalendarCheck },
    { label: "Reports", href: `${basePath}/reports`, icon: BarChart2 },
  ];

  const [showMore, setShowMore] = useState(false);

  const visibleItems = menuItems.slice(0, 4);
  const moreItems = menuItems.slice(4);

  const itemRefs = useRef([]);
  const [activeStyle, setActiveStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const index = visibleItems.findIndex((i) => i.href === pathname);

    if (index !== -1 && itemRefs.current[index]) {
      const el = itemRefs.current[index];

      requestAnimationFrame(() => {
        setActiveStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
        });
      });
    }
  }, [pathname]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 md:hidden z-50 px-2"
    >
      {/* 🌟 DOCK CONTAINER */}
      <div className="relative flex items-center gap-3 px-4 py-3 rounded-full backdrop-blur-2xl bg-white/30 border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-full before:bg-white/10 before:blur-xl before:opacity-60">

        {/* 🔥 ACTIVE SLIDING PILL */}
        <motion.div
          layout
          className="absolute top-1 h-12 rounded-full backdrop-blur-md border border-white/50 bg-gradient-to-b from-white/90 to-white/70"
          style={{
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
          animate={{
            left: activeStyle.left,
            width: activeStyle.width,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
            mass: 0.6,
          }}
        />

        {/* 🔥 MAIN ITEMS */}
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              scroll={false}
              prefetch={true}
              onClick={() => setShowMore(false)}
              className="relative flex flex-col items-center z-10 px-2"
              ref={(el) => (itemRefs.current[index] = el)}
            >
              {/* ICON */}
              <motion.div
                whileTap={{ scale: 0.75 }}
                whileHover={{ scale: 1.15 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="p-2 rounded-full relative"
              >
                <motion.div
                  animate={active ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <Icon
                    size={22}
                    className={`transition duration-300 ${
                      active
                        ? "text-black drop-shadow-[0_0_8px_rgba(0,0,0,0.4)]"
                        : "text-gray-700"
                    }`}
                  />
                </motion.div>
              </motion.div>

              {/* LABEL */}
              <motion.span
                className="text-[10px] mt-1 font-medium text-gray-900"
                animate={{
                  opacity: active ? 1 : 0.6,
                  y: active ? -1 : 2,
                  scale: active ? 1.05 : 1,
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item.label}
              </motion.span>

              {/* BADGE */}
              {item.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.4 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full shadow"
                >
                  {item.badge}
                </motion.span>
              )}
            </Link>
          );
        })}

        {/* 🔥 MORE BUTTON */}
        {moreItems.length > 0 && (
          <div className="relative z-10">
            <motion.div
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setShowMore(!showMore)}
            >
              <div className="p-2 rounded-full bg-gradient-to-b from-white/60 to-white/30 backdrop-blur-md border border-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
                <MoreHorizontal size={22} />
              </div>
              <span className="text-[10px] mt-1 font-medium">More</span>
            </motion.div>

            {/* 🔥 BACKDROP */}
            <AnimatePresence>
              {showMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
                  onClick={() => setShowMore(false)}
                />
              )}
            </AnimatePresence>

            {/* 🔥 POPUP MENU */}
            <AnimatePresence>
              {showMore && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 w-52 bg-white/60 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-2 flex flex-col gap-1 z-50"
                >
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        scroll={false}
                        prefetch={true}
                        onClick={() => setShowMore(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition ${
                          active
                            ? "bg-white shadow-md"
                            : "hover:bg-white/60"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>

                        {item.badge > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 rounded-full">
                            {item.badge}
                          </span>
                        )}
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
