"use client";

import { useState } from "react";
import { Search, Menu, X, Home, User, Globe } from "lucide-react";
import LoginModal from "./LoginModal";
import LanguageDropdown from "./LanguageDropdown";
import UserDropdown from "./UserDropdown";

export default function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* 🔥 HEADER */}
      <header className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3">

          {/* LOGO */}
          <img
            src="https://beta.venuebook.in/img/logo.490f6c58.svg"
            className="w-28 sm:w-36"
            alt="logo"
          />

          {/* 🔥 DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6">
            <button className="flex items-center gap-2 text-gray-600 hover:text-black transition">
              <Search size={18} />
              <span className="text-sm">Search Venues</span>
            </button>

            <button
              onClick={() => setLoginOpen(true)}
              className="text-sm font-medium hover:text-black"
            >
              Switch to Vendor
            </button>

            <LanguageDropdown />
            <UserDropdown />
          </div>

          {/* 🔥 MOBILE HAMBURGER */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 border rounded-lg"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* 🔥 MOBILE DRAWER */}
      <div
        className={`fixed inset-0 z-50 ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            menuOpen ? "opacity-40" : "opacity-0"
          }`}
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-[80%] max-w-sm bg-white p-5 transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button onClick={() => setMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* MENU ITEMS */}
          <div className="flex flex-col gap-5">

            <button className="flex items-center gap-3 text-gray-700">
              <Search size={18} />
              Search Venues
            </button>

            <button
              onClick={() => {
                setLoginOpen(true);
                setMenuOpen(false);
              }}
              className="text-left text-sm font-medium"
            >
              Switch to Vendor
            </button>

            <div className="border-t pt-4" />

            <LanguageDropdown />
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* 🔥 MOBILE FOOTER MENU */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden">
        <div className="flex justify-around items-center py-2">

          {/* Home */}
          <button className="flex flex-col items-center text-xs text-gray-700 hover:text-black">
            <Home size={20} />
            Home
          </button>

          {/* Search */}
          <button className="flex flex-col items-center text-xs text-gray-700 hover:text-black">
            <Search size={20} />
            Search
          </button>

          {/* Language (fixed alignment) */}
          <button className="flex flex-col items-center text-xs text-gray-700">
            <Globe size={20} />
            <span className="text-[10px] mt-1">Lang</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => setLoginOpen(true)}
            className="flex flex-col items-center text-xs text-gray-700 hover:text-black"
          >
            <User size={20} />
            Profile
          </button>
        </div>
      </div>

      {/* 🔥 LOGIN MODAL */}
      <LoginModal open={loginOpen} setOpen={setLoginOpen} />
    </>
  );
}
