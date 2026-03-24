"use client";

import { useState } from "react";
import {
  Bell,
  User,
  Home,
  Compass,
  Briefcase,
  ArrowLeft,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import LocaleCountrySwitcher from "@/components/i18n/LocaleCountrySwitcher";

export default function SearchBar({ openFilter }) {
  const [activeTab, setActiveTab] = useState("venues");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const tabs = [
    { id: "venues", label: "Venue", icon: Home },
    { id: "Framstay", label: "Framstay", icon: Compass },
  ];

  return (
    <>
      {/* ================= DESKTOP HEADER ================= */}
      <div className="hidden md:block sticky top-0 z-40 bg-white border-b border-b-gray-200">

        <div className="flex items-center justify-between px-6 py-3">

          {/* LOGO */}
          <img
            src="https://beta.venuebook.in/img/logo.490f6c58.svg"
            className="w-32"
          />

          {/* CENTER TABS */}
          <div className="flex flex-1 justify-center">
            <div className="flex items-center gap-10">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex flex-col items-center group"
                  >
                    <Icon
                      size={22}
                      className={active ? "text-black" : "text-gray-400"}
                    />
                    <span
                      className={`text-sm ${
                        active ? "font-semibold" : "text-gray-500"
                      }`}
                    >
                      {tab.label}
                    </span>
                    <div
                      className={`h-[2px] mt-1 w-6 ${
                        active ? "bg-black" : "bg-transparent"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <LocaleCountrySwitcher />

            <div className="relative">
              <div
                onClick={() => setNotifOpen(!notifOpen)}
                className="cursor-pointer relative"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                  3
                </span>
              </div>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-xl shadow p-3">
                  <p className="text-sm py-2 border-b border-b-gray-200">New booking</p>
                  <p className="text-sm py-2 border-b border-b-gray-200">Approved</p>
                  <p className="text-sm py-2">New review</p>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 border border-gray-200 rounded-full px-2 py-1"
              >
                <User size={18} />
                <img src="https://i.pravatar.cc/40" className="w-6 h-6 rounded-full" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 bg-white border border-gray-200 rounded-xl shadow w-40">
                  <button className="block w-full px-4 py-2 hover:bg-gray-50 text-left">
                    Profile
                  </button>
                  <button className="block w-full px-4 py-2 hover:bg-gray-50 text-left">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-b-gray-200 px-3 py-2">

        <div className="flex items-center gap-2">

          {/* BACK BUTTON */}
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          {/* SEARCH INPUT */}
          <div className="flex items-center flex-1 border border-gray-200 rounded-full px-3 py-2 bg-gray-100">
            <Search size={16} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search venues..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          {/* FILTER BUTTON */}
          <button
            onClick={openFilter}
            className="p-2 rounded-full border border-gray-200"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      {/* ================= MOBILE BOTTOM NAV ================= */}
<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-t-gray-200 z-50">

  <div className="flex justify-between items-center px-2 py-2">

    {/* HOME */}
    <button
      onClick={() => setActiveTab("venues")}
      className="flex flex-col items-center text-xs flex-1"
    >
      <Home
        size={20}
        className={activeTab === "venues" ? "text-black" : "text-gray-400"}
      />
      <span className={activeTab === "venues" ? "font-semibold" : "text-gray-500"}>
        Home
      </span>
    </button>

    {/* FARMSTAY */}
    <button
      onClick={() => setActiveTab("Framstay")}
      className="flex flex-col items-center text-xs flex-1"
    >
      <Compass
        size={20}
        className={activeTab === "Framstay" ? "text-black" : "text-gray-400"}
      />
      <span className={activeTab === "Framstay" ? "font-semibold" : "text-gray-500"}>
        Farmstay
      </span>
    </button>

    {/* COMPARE */}
    <button className="relative flex flex-col items-center text-xs flex-1">
      <Briefcase size={20} className="text-gray-400" />

      {/* BADGE */}
      <span className="absolute -top-1 right-5 bg-purple-600 text-white text-[10px] px-1.5 rounded-full">
        2
      </span>

      <span className="text-gray-500">Compare</span>
    </button>

    {/* PROFILE / LOGIN */}
    <button className="flex flex-col items-center text-xs flex-1">

      {/* CHANGE THIS CONDITION */}
      {false ? (
        <>
          <img
            src="https://i.pravatar.cc/40"
            className="w-6 h-6 rounded-full"
          />
          <span className="text-gray-500">Profile</span>
        </>
      ) : (
        <>
          <User size={20} className="text-gray-400" />
          <span className="text-gray-500">Login</span>
        </>
      )}

    </button>

  </div>
</div>
    </>
  );
}