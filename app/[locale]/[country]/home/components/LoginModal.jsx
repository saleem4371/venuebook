"use client";

import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function LoginModal({ open, setOpen }) {
  const [mode, setMode] = useState("login"); // login | register

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Center */}
      <div className="fixed inset-0 flex items-center justify-center p-4">

        {/* PANEL */}
        <Dialog.Panel className="w-full max-w-5xl rounded-2xl overflow-hidden bg-white shadow-2xl flex">

          {/* 🔥 LEFT IMAGE (DESKTOP ONLY) */}
          <div className="hidden md:flex w-1/2 relative">
            <img
              src="https://beta.venuebook.in/img/only%20image%20(1).d0c2e9c3.jpg" // put image in public
              className="object-cover w-full h-full"
              alt=""
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-black/60 p-8 flex flex-col justify-center text-white">
              <h2 className="text-3xl font-bold mb-4">
                Book Smarter,<br />Host Better,<br />Save Money
              </h2>

              <ul className="space-y-2 text-sm text-gray-200">
                <li>✔ Search Thousands of Venues</li>
                <li>✔ Transparent Pricing</li>
                <li>✔ Book with Confidence</li>
              </ul>
            </div>
          </div>

          {/* 🔥 RIGHT FORM */}
          <div className="w-full md:w-1/2 p-6 md:p-10 relative">

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-semibold mb-2">
              {mode === "login" ? "Log in to your account" : "Create your account"}
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              {mode === "login" ? (
                <>
                  Don’t have an account?{" "}
                  <span
                    onClick={() => setMode("register")}
                    className="text-purple-600 cursor-pointer"
                  >
                    Join here
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    onClick={() => setMode("login")}
                    className="text-purple-600 cursor-pointer"
                  >
                    Login
                  </span>
                </>
              )}
            </p>

            {/* Google */}
            <button className="w-full border rounded-lg py-3 flex items-center justify-center gap-2 mb-4 hover:bg-gray-50">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* FORM */}
            <div className="space-y-4">

              {mode === "register" && (
                <input
                  placeholder="Full Name"
                  className="w-full border p-3 rounded-lg"
                />
              )}

              <input
                placeholder="Email"
                className="w-full border p-3 rounded-lg"
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full border p-3 rounded-lg"
              />

              {mode === "register" && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full border p-3 rounded-lg"
                />
              )}

              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl mt-2 hover:scale-[1.02] transition">
                {mode === "login" ? "Login" : "Create Account"}
              </button>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-400 mt-6">
              By joining, you agree to our Terms & Privacy Policy.
            </p>

          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
