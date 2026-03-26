"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { HomeIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";

import LoginModal from "./LoginModal";
import LanguageDropdown from "./LanguageDropdown";
import CountryDropdown from "./CountryDropdown";
import UserDropdown from "./UserDropdown";
import { useUI } from "@/context/UIContext";
import { useDropdown } from "@/context/DropdownContext";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { setFilterOpen, setLoginOpen, loginOpen } = useUI();
  const { openDropdown, toggleDropdown, closeAll } = useDropdown();
  const [activeTab, setActiveTab] = useState("venue");

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const currentLocale = params?.locale || "en";
  const currentLang = params?.country || "in";

  const isSearchPage =
    pathname.includes("/search") || pathname.includes("/venues");

  /* ---------------- RESPONSIVE ---------------- */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    const handleScroll = () => setScrolled(window.scrollY > 10);

    check();
    window.addEventListener("resize", check);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ---------------- BODY LOCK ---------------- */
  useEffect(() => {
    document.body.style.overflow = openMenu ? "hidden" : "auto";
  }, [openMenu]);

  /* ---------------- COUNTRY CHANGE ---------------- */
  const changeCountry = (code) => {
    closeAll();

    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      router.push(`/${code}`);
      return;
    }

    segments[0] = code;
    router.push("/" + segments.join("/"));
  };

  /* ---------------- LANGUAGE CHANGE ---------------- */
  const changeLanguage = (locale) => {
    closeAll();
    router.push(pathname.replace(`/${currentLocale}`, `/${locale}`));
  };

  /* ----------------CHANGE TYPE----------------------- */
  const handleTabChange = (type) => {
  setActiveTab(type);

  const routeType = type === "venue" ? "venues" : "farmstay";

  router.push(`/${currentLocale}/${currentLang}/search/${routeType}`);
};

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        className={`fixed top-0 w-full z-50 transition ${
          scrolled ? "bg-white/80 backdrop-blur shadow-md" : "bg-white"
        }`}
      >
        <div className="relative flex items-center justify-between px-4 md:px-10 py-3">
          {/* MOBILE SEARCH */}
          {isMobile && isSearchPage ? (
            <>
              <ArrowLeftIcon className="w-5" />

              <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2 mx-2">
                <MagnifyingGlassIcon className="w-5 text-gray-500 mr-2" />
                <input
                  placeholder="Search venues..."
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>

              <button
                onClick={() => setFilterOpen(true)}
                className="p-2 border rounded-full"
              >
                <AdjustmentsHorizontalIcon className="w-5" />
              </button>
            </>
          ) : (
            <>
              {/* LOGO */}
              <img
                src="https://www.venuebook.in/img/logo.490f6c58.svg"
                className="w-32 md:w-40"
              />

              {/* 🔥 CENTER TOGGLE (DESKTOP ONLY) */}
{isSearchPage && (
  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
    <div className="relative flex items-center bg-gray-100 p-1 rounded-full shadow-inner">

      {/* Animated Background */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute top-1 bottom-1 w-1/2 rounded-full bg-purple-600"
        style={{
          left: activeTab === "venue" ? "4px" : "50%",
        }}
      />

      {/* VENUE */}
      <button
        onClick={() => handleTabChange("venue")}
        className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition  cursor-pointer ${
          activeTab === "venue"
            ? "text-white"
            : "text-gray-600 hover:text-black"
        }`}
      >
        <BuildingOffice2Icon className="w-4 h-4" />
        Venue
      </button>

      {/* FARMSTAY */}
      <button
        onClick={() => handleTabChange("farmstay")}
        className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition  cursor-pointer ${
          activeTab === "farmstay"
            ? "text-white"
            : "text-gray-600 hover:text-black"
        }`}
      >
        <HomeIcon className="w-4 h-4" />
        Farmstay
      </button>
    </div>
  </div>
)}

              {/* DESKTOP */}
              {/* DESKTOP */}
<div className="hidden md:flex items-center gap-6">

  {/* 🔥 PREMIUM TOGGLE (ONLY SEARCH PAGE) */}
 

  <button className="hover:text-purple-600">Explore</button>

  <button
    onClick={() => setLoginOpen(true)}
    className="px-4 py-2 border border-gray-200 rounded-full hover:bg-purple-600 hover:text-white"
  >
    Switch to Vendor
  </button>

  <CountryDropdown />
  <LanguageDropdown />
  <UserDropdown />
</div>

              {/* MOBILE MENU */}
              <button
                onClick={() => setOpenMenu(true)}
                className="md:hidden"
              >
                <Bars3Icon className="w-7 h-7" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* ================= MOBILE DRAWER ================= */}
      <AnimatePresence>
        {openMenu && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setOpenMenu(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 w-[85%] max-w-sm h-full bg-white z-50 flex flex-col"
            >
              <div className="flex justify-between p-5 border-b">
                <p className="font-semibold">Menu</p>
                <XMarkIcon
                  className="w-6"
                  onClick={() => setOpenMenu(false)}
                />
              </div>

              <div className="flex-1 p-5 space-y-4">
                <button className="w-full text-left">Explore</button>

                <button
                  onClick={() => {
                    setLoginOpen(true);
                    setOpenMenu(false);
                  }}
                  className="w-full text-left text-purple-600"
                >
                  Switch to Vendor
                </button>

                {/* Preferences */}
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-3 uppercase">
                    Preferences
                  </p>

                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      setTimeout(() => toggleDropdown("country"), 200);
                    }}
                    className="w-full flex justify-between py-3"
                  >
                    🌍 Country <span>India</span>
                  </button>

                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      setTimeout(() => toggleDropdown("language"), 200);
                    }}
                    className="w-full flex justify-between py-3"
                  >
                    🌐 Language <span>English</span>
                  </button>

                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      setTimeout(() => toggleDropdown("user"), 200);
                    }}
                    className="w-full flex justify-between py-3"
                  >
                    👤 Account
                  </button>
                </div>
              </div>

              <div className="p-5 border-t text-sm text-gray-500">
                © 2026 VenueBook
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= OVERLAY ================= */}
      <AnimatePresence>
  {openDropdown && isMobile && (
    <motion.div
      onClick={closeAll}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[60]"
    />
  )}
</AnimatePresence>
      {/* ================= LANGUAGE SHEET ================= */}
      <AnimatePresence>
        {openDropdown === "language" && isMobile && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 right-0 bg-white p-5 rounded-t-3xl z-[70]"
          >
            <p className="text-lg font-semibold mb-4">Language</p>

            <button
              onClick={() => changeLanguage("en")}
              className="w-full py-3 border-b text-left"
            >
              English 🇺🇸
            </button>

            <button
              onClick={() => changeLanguage("hi")}
              className="w-full py-3 text-left"
            >
              Hindi 🇮🇳
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= COUNTRY SHEET ================= */}
      <AnimatePresence>
        {openDropdown === "country" && isMobile && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 right-0 bg-white p-5 rounded-t-3xl z-[70]"
          >
            <p className="text-lg font-semibold mb-4">Country</p>

            <button
              onClick={() => changeCountry("in")}
              className="w-full py-3 border-b text-left"
            >
              🇮🇳 India
            </button>

            <button
              onClick={() => changeCountry("ae")}
              className="w-full py-3 border-b text-left"
            >
              🇦🇪 UAE
            </button>

            <button
              onClick={() => changeCountry("us")}
              className="w-full py-3 text-left"
            >
              🇺🇸 USA
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= USER SHEET ================= */}
      <AnimatePresence>
        {openDropdown === "user" && isMobile && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 right-0 bg-white p-5 rounded-t-3xl z-[70]"
          >
            <p className="text-lg font-semibold mb-4">Account</p>

            <button className="w-full py-3 border-b text-left">
              My Bookings
            </button>

            <button className="w-full py-3 border-b text-left">
              Wishlist
            </button>

            <button className="w-full py-3 border-b text-left">
              Settings
            </button>

            <button
              onClick={() => {
                closeAll();
                setLoginOpen(true);
              }}
              className="w-full mt-4 bg-purple-600 text-white py-3 rounded-full"
            >
              Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGIN */}
      <LoginModal open={loginOpen} setOpen={setLoginOpen} />
    </>
  );
}