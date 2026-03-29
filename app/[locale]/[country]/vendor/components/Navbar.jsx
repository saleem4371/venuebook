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
  Bell,
  Settings,
  Package,
  Layers,
  MoreHorizontal
} from "lucide-react";
import { useState } from "react";

export default function PremiumNavbar() {
  const pathname = usePathname();
  const params = useParams();

  const basePath = `/${params?.locale}/${params?.country}/vendor`;

  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ NEW STATES
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const menuItems = [
    { label: "Dashboard", href: `${basePath}/dashboard`, icon: Home },
    { label: "Listing", href: `${basePath}/listing`, icon: Home },
    { label: "Leads", href: `${basePath}/leads`, icon: Users, badge: 12 },
    { label: "Bookings", href: `${basePath}/bookings`, icon: Calendar, badge: 2 },
    { label: "Calendar", href: `${basePath}/calendar`, icon: CalendarCheck },
  
    { label: "Addons", href: `${basePath}/addons`, icon: Layers },
    { label: "Packages", href: `${basePath}/package`, icon: Package },
    { label: "Settings", href: `${basePath}/settings`, icon: Settings },
    { label: "Reports", href: `${basePath}/reports`, icon: BarChart2 },
  ];

  const visibleItems = menuItems.slice(0, 5);
const moreItems = menuItems.slice(5);
const [showMore, setShowMore] = useState(false);

  // ✅ SAMPLE NOTIFICATIONS
  const notifications = [
    "New lead received",
    "Booking confirmed",
    "Payment received",
  ];

  return (
    <div className="sticky top-0 z-50 bg-white/30 backdrop-blur-xl border-b border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <img
          src="https://www.venuebook.in/img/logo.490f6c58.svg"
          className="w-32"
          alt="logo"
        />

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-2 relative">

  {/* MAIN ITEMS */}
  {visibleItems.map((item) => {
    const Icon = item.icon;
    const active = pathname.startsWith(item.href);

    return (
      <Link key={item.label} href={item.href}>
        <div className="relative px-4 py-2 rounded-xl cursor-pointer">

          {active && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white/60 rounded-xl shadow-md"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          <div className="relative flex items-center gap-2 z-10">
            <Icon size={18} />
            <span className="text-sm font-medium">{item.label}</span>

            {item.badge > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  })}

  {/* 🔥 MORE BUTTON */}
  <div className="relative">
    <motion.div
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => setShowMore(!showMore)}
      className="px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2 bg-white/40 backdrop-blur-md"
    >
      <MoreHorizontal size={18} />
      <span className="text-sm font-medium">More</span>
    </motion.div>

    {/* BACKDROP */}
    <AnimatePresence>
      {showMore && (
        <motion.div
          className="fixed inset-0 z-40"
          onClick={() => setShowMore(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </AnimatePresence>

    {/* DROPDOWN */}
    <AnimatePresence>
      {showMore && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="absolute right-0 mt-3 w-52 
          bg-white/80 backdrop-blur-2xl 
          border border-white/30 
          rounded-2xl shadow-2xl p-2 z-50"
        >
          {moreItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setShowMore(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition
                ${active ? "bg-indigo-500/10 text-indigo-600" : "hover:bg-white/60"}`}
              >
                <Icon size={18} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 relative">

          {/* 🔔 NOTIFICATION */}
          <div className="relative">
            <motion.div
              whileTap={{ scale: 0.85 }}
              className="p-2 rounded-full bg-white/30 backdrop-blur-md cursor-pointer"
              onClick={() => setShowNotif(!showNotif)}
            >
              <Bell className="text-gray-700" size={18} />
              
              {/* Badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                3
              </span>
            </motion.div>

            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-3"
                >
                  <h4 className="font-semibold text-sm mb-2">
                    Notifications
                  </h4>

                  <div className="space-y-2">
                    {notifications.map((note, i) => (
                      <div
                        key={i}
                        className="text-sm p-2 rounded-lg hover:bg-white/60 cursor-pointer"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 👤 PROFILE */}
          <div className="relative">
            <img
              src="https://i.pravatar.cc/100"
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => setShowProfile(!showProfile)}
            />

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-44 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-2 flex flex-col"
                >
                  <Link
                    href={`${basePath}/profile`}
                    className="px-3 py-2 rounded-lg hover:bg-white/60 text-sm"
                  >
                    Profile
                  </Link>

                  <Link
                    href={`${basePath}/settings`}
                    className="px-3 py-2 rounded-lg hover:bg-white/60 text-sm flex items-center gap-2"
                  >
                    <Settings size={16} /> Settings
                  </Link>

                  <Link
                    href="/logout"
                    className="px-3 py-2 rounded-lg hover:bg-white/60 text-sm"
                  >
                    Logout
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
