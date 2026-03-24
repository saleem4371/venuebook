"use client";

import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

import LoginModal from "./LoginModal";
import LanguageDropdown from "./LanguageDropdown";
import UserDropdown from "./UserDropdown";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-10 py-4">

          {/* LOGO */}
          <img
            src="https://beta.venuebook.in/img/logo.490f6c58.svg"
            className="w-32 md:w-40"
          />

          {/* DESKTOP */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">

            <button className="hover:text-purple-600">Explore</button>
            <button className="hover:text-purple-600">About</button>
            <button className="hover:text-purple-600">Contact</button>

            <button
              onClick={() => setLoginOpen(true)}
              className="px-4 py-2 border rounded-full hover:bg-gray-100"
            >
              Switch to Vendor
            </button>

            <LanguageDropdown />
            <UserDropdown />
          </div>

          {/* MOBILE */}
          <button onClick={() => setOpenMenu(true)} className="md:hidden">
            <Bars3Icon className="w-7 h-7" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
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
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
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
                <button>About</button>
                <button>Contact</button>

                <button
                  onClick={() => {
                    setLoginOpen(true);
                    setOpenMenu(false);
                  }}
                  className="text-purple-600 font-medium"
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
