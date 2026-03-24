"use client";

import { motion } from "framer-motion";
import { Phone, Facebook, Instagram, MessageCircle } from "lucide-react";

export default function PremiumFooter() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white">venuebook.in</h2>
          <p className="mt-4 text-sm leading-relaxed">
            Discover and book amazing venues for your special occasions. From intimate gatherings to grand celebrations.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Phone size={18} />
            <div>
              <p className="font-semibold text-white">733 868 4444</p>
              <p className="text-xs">Mon–Sat: 9:30 AM – 6:30 PM</p>
            </div>
          </div>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-white font-semibold mb-4">Venuebook</h3>
          <ul className="space-y-2 text-sm">
            {[
              "About Us",
              "Privacy Policy",
              "Terms of Service",
              "Market Declaration",
            ].map((item, i) => (
              <li
                key={i}
                className="hover:text-white transition cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-white font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            {[
              "How it Works for Venue",
              "Cancellation Policy",
            ].map((item, i) => (
              <li
                key={i}
                className="hover:text-white transition cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
          <p className="text-sm mb-4">
            Get latest venue updates & offers.
          </p>

          <div className="flex items-center bg-gray-800 rounded-xl overflow-hidden">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent px-4 py-2 text-sm w-full outline-none"
            />
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-white text-sm font-medium">
              Subscribe
            </button>
          </div>

          <div className="flex gap-4 mt-6">
            <Facebook className="hover:text-white cursor-pointer" />
            <Instagram className="hover:text-white cursor-pointer" />
            <MessageCircle className="hover:text-white cursor-pointer" />
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© 2026 venuebook.in. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
