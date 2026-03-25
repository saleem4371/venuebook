"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon
  
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

import LoginModal from "./LoginModal";
import LanguageDropdown from "./LanguageDropdown";
import UserDropdown from "./UserDropdown";

import { useUI } from "@/context/UIContext";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(false);
//   const [loginOpen, setLoginOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { setFilterOpen, setLoginOpen, loginOpen } = useUI();

  const pathname = usePathname();

  const isSearchPage =
    pathname.includes("/search") || pathname.includes("/venues");

  // ✅ Mobile detect
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-10 py-3">

          {/* 📱 MOBILE SEARCH HEADER */}
          {isMobile && isSearchPage ? (
            <>
              {/* 🔍 Search */}
               <button className="px-3 py-2  text-sm"  >
                 <ArrowLeftIcon className="w-5 h-5" />
              </button>
             
              <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
                <MagnifyingGlassIcon className="w-5 text-gray-500 mr-2" />
                <input
                  placeholder="Search venues..."
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>

              {/* Filter */}
              <button className="ml-3 px-3 py-2 border rounded-full text-sm"  onClick={() => setFilterOpen(true)}>
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              {/* 💻 DESKTOP or NORMAL NAVBAR */}

              {/* LOGO */}
              <img
                src="https://beta.venuebook.in/img/logo.490f6c58.svg"
                className="w-32 md:w-40"
              />

              {/* 💻 DESKTOP SEARCH PAGE → SHOW TABS */}

               {isSearchPage && (
                <div className="hidden md:flex items-center gap-4 ml-10">
                  <button className="px-4 py-2 rounded-full bg-purple-500 text-white">
                    Venues
                  </button>
                  <button className="px-4 py-2 rounded-full border">
                    Farmstay
                  </button>
                </div>
               )}
              
                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                  <button className="hover:text-purple-600">Explore</button>

                  <button
                    onClick={() => setLoginOpen(true)}
                    className="px-4 py-2 border rounded-full"
                  >
                    Switch to Vendor
                  </button>

                  <LanguageDropdown />
                  <UserDropdown />
                </div>
              

              {/* MOBILE MENU */}
              <button onClick={() => setOpenMenu(true)} className="md:hidden">
                <Bars3Icon className="w-7 h-7" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* 📱 MOBILE DRAWER */}
      <AnimatePresence>
        {openMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setOpenMenu(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed left-0 top-0 h-full w-72 bg-white z-50 p-5"
            >
              <div className="flex justify-between mb-6">
                <img
                  src="https://beta.venuebook.in/img/logo.490f6c58.svg"
                  className="w-28"
                />
                <button onClick={() => setOpenMenu(false)}>
                  <XMarkIcon className="w-6" />
                </button>
              </div>

              <div className="flex flex-col gap-5">
                <button>Explore</button>

                <button
                  onClick={() => {
                    setLoginOpen(true);
                    setOpenMenu(false);
                  }}
                  className="text-purple-600"
                >
                  Switch to Vendor
                </button>

                <LanguageDropdown />
                <UserDropdown />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LoginModal open={loginOpen} setOpen={setLoginOpen} />
    </>
  );
}