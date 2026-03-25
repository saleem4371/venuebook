"use client";

import { useEffect, useState, useRef } from "react";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  UserIcon,
  MapIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";

export default function BottomMenu() {
  const { setShowMap, hideBottomMenu , setLoginOpen} = useUI();

  const [visible, setVisible] = useState(true);
  const lastScroll = useRef(0);

  const pathname = usePathname();
  const router = useRouter();

  // 🔥 Extract locale + country dynamically
  const segments = pathname.split("/");
  const locale = segments[1];
  const country = segments[2];

  const isSearchPage =
    pathname.includes("/search") || pathname.includes("/venues");

  // 🔥 Scroll hide/show
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;

      if (current > lastScroll.current && current > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastScroll.current = current;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔥 Navigation helper
  const go = (path) => {
    router.push(`/${locale}/${country}${path}`);
  };

  return (
    <AnimatePresence>
      {visible && !hideBottomMenu && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden"
        >
          <div className="flex items-center gap-6 bg-white/80 backdrop-blur-lg px-6 py-3 rounded-full shadow-2xl border">

            <NavItem
              icon={<HomeIcon className="w-5" />}
              label="Home"
              active={pathname === `/${locale}/${country}`}
              onClick={() => go("")}
            />

            <NavItem
              icon={<MagnifyingGlassIcon className="w-5" />}
              label="Search"
              active={pathname.includes("/search")}
              onClick={() => go("/search")}
            />

            <NavItem
              icon={<HeartIcon className="w-5" />}
              label="Wishlist"
              active={pathname.includes("/wishlist")}
              onClick={() => go("/wishlist")}
            />

            <NavItem
              icon={<UserIcon className="w-5" />}
              label="Profile"
              active={pathname.includes("/profile")}
              onClick={() => setLoginOpen(true)}
            />

            {/*  onClick={() => go("/profile")} */}

            {isSearchPage && (
              <NavItem
                icon={<MapIcon className="w-5" />}
                label="Map"
                onClick={() => setShowMap(true)}
               
              />
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 🔥 NavItem Component with Active State
function NavItem({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-[10px] transition ${
        active ? "text-purple-600" : "text-gray-600"
      } active:scale-90`}
    >
      {icon}
      {label}
    </button>
  );
}