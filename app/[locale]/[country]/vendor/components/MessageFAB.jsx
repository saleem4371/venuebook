"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useUI } from "@/context/VendorUIContext";

export default function MessageFAB() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const params = useParams();

  const { setIsFabOpen, isModalOpen } = useUI(); // 🔥 context

  const basePath = `/${params?.locale}/${params?.country}/vendor/chat`;

  // 🔥 Update context when FAB opens/closes
  useEffect(() => {
    setIsFabOpen(open);
  }, [open, setIsFabOpen]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const chatmessage = () => {
    router.push(basePath);
  };

  return (
    <>
      {/* BACKDROP */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB BUTTON */}
      {!isModalOpen && ( // 🔥 hide FAB if modal open
        <motion.button
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className={`
            fixed z-50 flex items-center justify-center cursor-pointer
            ${isMobile ? "right-4 bottom-24" : "bottom-6 right-6"}
            w-14 h-14 rounded-full
            bg-white/20 backdrop-blur-xl border border-white/30
            shadow-lg hover:shadow-xl transition-all duration-300
          `}
        >
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-6 h-6"
          >
            {open ? <span className="text-white text-xl">✕</span> : <span className="text-white text-xl">💬</span>}
          </motion.div>

          {!open && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
              5
            </span>
          )}
        </motion.button>
      )}

      {/* DESKTOP POPUP */}
      {!isMobile && !isModalOpen && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="fixed bottom-24 right-6 w-80 rounded-2xl 
              bg-white/70 backdrop-blur-2xl border border-white/30 
              shadow-2xl z-50 overflow-hidden"
            >
              <Header chatmessage={chatmessage} />
              <ChatList chatmessage={chatmessage} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* MOBILE BOTTOM SHEET */}
      {isMobile && !isModalOpen && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 120 }}
              className="fixed bottom-0 left-0 right-0 h-[75vh]
              bg-white/80 backdrop-blur-xl rounded-t-3xl 
              shadow-2xl z-50 overflow-hidden"
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />
              <Header mobile chatmessage={chatmessage} />
              <ChatList chatmessage={chatmessage} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}

// --- Header Component ---
function Header({ mobile, chatmessage }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50">
      <h2 className="font-semibold text-gray-800">Messages</h2>

      {!mobile && (
        <button
          className="text-xs text-blue-600 hover:underline"
          onClick={chatmessage} 
        >
          View All
        </button>
      )}
    </div>
  );
}

// --- Chat List Component ---
function ChatList({ chatmessage }) {
  const chats = [
    { name: "Venue Team", unread: 3 },
    { name: "Bookings", unread: 1 },
    { name: "Support", unread: 0 },
  ];

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {chats.map((chat, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between p-4 cursor-pointer transition rounded-xl mx-2 my-1 hover:bg-white/60"
          onClick={() => chatmessage()}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white flex items-center justify-center font-semibold">
              {chat.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{chat.name}</p>
              <p className="text-xs text-gray-400">Tap to open chat</p>
            </div>
          </div>
          {chat.unread > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow">
              {chat.unread}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}