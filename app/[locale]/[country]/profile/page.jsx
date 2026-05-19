"use client";

import { useState } from "react";
import {
  User,
  CalendarDays,
  Bell,
  MessageCircle,
  Settings,
  Lock,
  ChevronRight,
  Send,
} from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("bookings");

  const menus = [
    {
      key: "bookings",
      label: "My Bookings",
      icon: CalendarDays,
    },
    {
      key: "messages",
      label: "Messages",
      icon: MessageCircle,
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      key: "settings",
      label: "Account Settings",
      icon: Settings,
    },
    {
      key: "password",
      label: "Change Password",
      icon: Lock,
    },
  ];

 return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 relative overflow-hidden">

    {/* BLUR BACKGROUND */}
    <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl" />

    {/* PAGE */}
    <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-24 pb-10">

      {/* PROFILE HEADER */}
      <div
        className="
        bg-white/40
        backdrop-blur-xl
        border border-white/30
        rounded-[32px]
        p-6 lg:p-8
        shadow-[0_8px_32px_rgba(31,38,135,0.12)]
      "
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div className="flex items-center gap-5">

            <div className="relative">
              <img
                src="https://i.pravatar.cc/150"
                alt=""
                className="
                w-24 h-24 rounded-full object-cover
                border-4 border-white/50
                shadow-lg
              "
              />

              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-zinc-800">
                Saleem Khan
              </h1>

              <p className="text-zinc-600 mt-1">
                saleem@gmail.com
              </p>

              <div className="flex items-center gap-2 mt-3 text-sm text-zinc-600">
                <User size={16} />
                Premium Customer
              </div>
            </div>
          </div>

          <button
            className="
            bg-indigo-600/90
            hover:bg-indigo-700
            text-white
            px-6 py-3
            rounded-2xl
            font-medium
            shadow-lg
            transition-all duration-300
            hover:scale-[1.02]
          "
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">

        {/* LEFT MENU */}
        <div className="lg:col-span-3">

          <div
            className="
            bg-white/40
            backdrop-blur-xl
            border border-white/30
            rounded-[32px]
            p-4
            shadow-[0_8px_32px_rgba(31,38,135,0.12)]
          "
          >
            <div className="space-y-3">

              {menus.map((menu) => {
                const Icon = menu.icon;

                return (
                  <button
                    key={menu.key}
                    onClick={() => setActiveTab(menu.key)}
                    className={`
                    w-full flex items-center justify-between
                    px-4 py-4 rounded-2xl
                    transition-all duration-300
                    ${
                      activeTab === menu.key
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "hover:bg-white/50 text-zinc-700"
                    }
                  `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />

                      <span className="font-medium">
                        {menu.label}
                      </span>
                    </div>

                    <ChevronRight size={18} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="lg:col-span-9">

          {/* BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="space-y-5">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="
                  bg-white/40
                  backdrop-blur-xl
                  border border-white/30
                  rounded-[32px]
                  p-6
                  shadow-[0_8px_32px_rgba(31,38,135,0.12)]
                "
                >
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-800">
                        Royal Palace Booking
                      </h2>

                      <div className="flex flex-wrap gap-4 mt-3 text-zinc-600 text-sm">

                        <p>
                          Booking ID:
                          <span className="font-medium text-zinc-800 ml-1">
                            #BK1023
                          </span>
                        </p>

                        <p>
                          Date:
                          <span className="font-medium text-zinc-800 ml-1">
                            25 May 2026
                          </span>
                        </p>

                        <p>
                          Guests:
                          <span className="font-medium text-zinc-800 ml-1">
                            300
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                      <span className="bg-green-100/80 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
                        Confirmed
                      </span>

                      <button className="bg-white/60 hover:bg-white text-zinc-700 px-5 py-2 rounded-xl transition">
                        View
                      </button>

                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl transition">
                        Invoice
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div
              className="
              bg-white/40
              backdrop-blur-xl
              border border-white/30
              rounded-[32px]
              p-6 lg:p-8
              shadow-[0_8px_32px_rgba(31,38,135,0.12)]
            "
            >
              <h2 className="text-2xl font-bold mb-8 text-zinc-800">
                Account Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <Input
                  label="Full Name"
                  placeholder="Enter full name"
                />

                <Input
                  label="Email Address"
                  placeholder="Enter email address"
                />

                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                />

                <Input
                  label="Location"
                  placeholder="Enter location"
                />
              </div>

              <button
                className="
                mt-8 bg-indigo-600 hover:bg-indigo-700
                text-white px-7 py-3 rounded-2xl
                font-medium transition-all
              "
              >
                Save Changes
              </button>
            </div>
          )}

          {/* MESSAGES */}
{activeTab === "messages" && (
  <div
    className="
    bg-white/40
    backdrop-blur-xl
    border border-white/30
    rounded-[32px]
    shadow-[0_8px_32px_rgba(31,38,135,0.12)]
    overflow-hidden
    h-[750px]
    flex flex-col lg:flex-row
  "
  >

    {/* CHAT LIST */}
    <div className="w-full lg:w-[340px] border-r border-white/20 bg-white/10">

      <div className="p-6 border-b border-white/20">
        <h2 className="text-[20px] font-semibold text-zinc-800">
          Messages
        </h2>

        <p className="text-sm text-zinc-500 mt-1">
          Recent conversations
        </p>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto">

        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="
            bg-white/50
            hover:bg-white/70
            transition-all
            rounded-2xl
            p-4
            cursor-pointer
            border border-white/20
          "
          >
            <div className="flex items-center gap-4">

              <div className="relative">
                <img
                  src="https://i.pravatar.cc/60"
                  alt=""
                  className="w-14 h-14 rounded-full object-cover"
                />

                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>

              <div className="flex-1 min-w-0">

                <div className="flex items-center justify-between gap-2">

                  <h3 className="font-semibold text-[15px] text-zinc-800 truncate">
                    Support Team
                  </h3>

                  <span className="text-[12px] text-zinc-500">
                    2m
                  </span>
                </div>

                <p className="text-[13px] text-zinc-500 truncate mt-1">
                  Hello, your booking is confirmed successfully.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* CHAT AREA */}
    <div className="flex-1 flex flex-col">

      {/* TOP */}
      <div className="p-5 border-b border-white/20 bg-white/10">

        <div className="flex items-center gap-4">

          <div className="relative">
            <img
              src="https://i.pravatar.cc/60"
              alt=""
              className="w-14 h-14 rounded-full"
            />

            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
          </div>

          <div>
            <h3 className="font-semibold text-[16px] text-zinc-800">
              Support Team
            </h3>

            <p className="text-[13px] text-green-600">
              Active now
            </p>
          </div>
        </div>
      </div>

      {/* CHAT BODY */}
      <div className="flex-1 overflow-y-auto p-6 bg-transparent space-y-5">

        <div className="flex justify-start">
          <div
            className="
            bg-white/70
            backdrop-blur-md
            px-5 py-4
            rounded-[22px]
            max-w-md
            shadow-sm
          "
          >
            <p className="text-[14px] text-zinc-700 leading-6">
              Hello 👋 Your booking has been confirmed successfully.
            </p>

            <span className="text-[11px] text-zinc-400 mt-2 block">
              10:24 AM
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <div
            className="
            bg-indigo-600
            px-5 py-4
            rounded-[22px]
            max-w-md
            shadow-sm
          "
          >
            <p className="text-[14px] text-white leading-6">
              Thank you. Can you share invoice details?
            </p>

            <span className="text-[11px] text-indigo-100 mt-2 block">
              10:26 AM
            </span>
          </div>
        </div>
      </div>

      {/* INPUT */}
      <div className="p-5 border-t border-white/20 bg-white/10">

        <div className="flex items-center gap-3">

          <input
            type="text"
            placeholder="Type your message..."
            className="
            flex-1
            bg-white/70
            border border-white/30
            rounded-2xl
            px-5 py-4
            outline-none
            text-[14px]
            placeholder:text-zinc-400
            focus:border-indigo-400
          "
          />

          <button
            className="
            w-14 h-14
            rounded-2xl
            bg-indigo-600
            hover:bg-indigo-700
            flex items-center justify-center
            text-white
            transition-all
            shadow-lg
          "
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* NOTIFICATIONS */}
{activeTab === "notifications" && (
  <div className="space-y-5">

    {[1, 2, 3, 4].map((item) => (
      <div
        key={item}
        className="
        bg-white/40
        backdrop-blur-xl
        border border-white/30
        rounded-[30px]
        p-6
        shadow-[0_8px_32px_rgba(31,38,135,0.10)]
      "
      >
        <div className="flex items-start justify-between gap-5">

          <div className="flex gap-4">

            <div
              className="
              w-14 h-14
              rounded-2xl
              bg-indigo-100
              flex items-center justify-center
              shrink-0
            "
            >
              <Bell className="text-indigo-600" size={24} />
            </div>

            <div>

              <h3 className="text-[17px] font-semibold text-zinc-800">
                Booking Approved
              </h3>

              <p className="text-[14px] text-zinc-500 mt-2 leading-7">
                Your booking request has been approved successfully.
                Please check invoice and payment details.
              </p>

              <div className="flex items-center gap-3 mt-4">

                <button
                  className="
                  bg-indigo-600
                  hover:bg-indigo-700
                  text-white
                  text-[13px]
                  px-5 py-2.5
                  rounded-xl
                  transition-all
                "
                >
                  View Booking
                </button>

                <button
                  className="
                  bg-white/60
                  hover:bg-white
                  text-zinc-700
                  text-[13px]
                  px-5 py-2.5
                  rounded-xl
                  transition-all
                "
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>

          <span className="text-[12px] text-zinc-400 whitespace-nowrap">
            2h ago
          </span>
        </div>
      </div>
    ))}
  </div>
)}

          {/* PASSWORD */}
          {activeTab === "password" && (
            <div
              className="
              bg-white/40
              backdrop-blur-xl
              border border-white/30
              rounded-[32px]
              p-6 lg:p-8
              shadow-[0_8px_32px_rgba(31,38,135,0.12)]
              max-w-3xl
            "
            >
              <h2 className="text-2xl font-bold mb-8 text-zinc-800">
                Change Password
              </h2>

              <div className="space-y-6">

                <Input
                  label="Current Password"
                  placeholder="Current password"
                  type="password"
                />

                <Input
                  label="New Password"
                  placeholder="New password"
                  type="password"
                />

                <Input
                  label="Confirm Password"
                  placeholder="Confirm password"
                  type="password"
                />
              </div>

              <button
                className="
                mt-8 bg-indigo-600 hover:bg-indigo-700
                text-white px-7 py-3 rounded-2xl
                font-medium transition-all
              "
              >
                Update Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}

/* INPUT COMPONENT */
function Input({
  label,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="block mb-2 font-medium text-zinc-700">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full border border-zinc-300 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500"
      />
    </div>
  );
}