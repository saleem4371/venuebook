"use client";

/**
 * MessageFAB — Floating messages button (all screen sizes)
 * ─────────────────────────────────────────────────────────────────────────────
 * • Hidden when the user is already on /vendor/messages
 * • Navigates directly to the messages page on tap
 * • Uses shared ChatBubbleIcon — same icon as the BottomDock More sheet
 */

import { motion }              from "framer-motion";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useUI }               from "@/context/VendorUIContext";
import ChatBubbleIcon          from "./ChatBubbleIcon";

export default function MessageFAB() {
  const router   = useRouter();
  const params   = useParams();
  const pathname = usePathname();
  const { isModalOpen } = useUI();

  const messagesPath = `/${params?.locale}/${params?.country}/vendor/messages`;

  /* Hide when already on the messages page or when a modal is open */
  if (isModalOpen || pathname.includes("/vendor/messages")) return null;

  return (
    <div
      className="
        fixed z-50 md:hidden
        right-3
        bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+96px)]
      "
    >
      <motion.button
        type="button"
        aria-label="Open messages"
        onClick={() => router.push(messagesPath)}
        className="
          relative w-12 h-12 rounded-full
          bg-white/82 dark:bg-[#0b0e1c]/82
          backdrop-blur-2xl
          border border-white/70 dark:border-white/[0.08]
          shadow-[0_8px_24px_rgba(0,0,0,0.09),0_2px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.55)]
          dark:shadow-[0_8px_24px_rgba(0,0,0,0.44),0_2px_6px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.03)]
          flex items-center justify-center
          cursor-pointer select-none outline-none
          focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-1
        "
        style={{ width: 48, height: 48 }}
        whileTap={{ scale: 0.84, transition: { duration: 0.12 } }}
        whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
      >
        <ChatBubbleIcon
          size={20}
          strokeWidth={1.7}
          className="text-violet-600 dark:text-violet-400"
        />

        {/* Unread badge */}
        <span
          className="
            absolute -top-0.5 -right-0.5
            w-5 h-5 rounded-full
            bg-red-500 text-white text-[9px] font-bold leading-none
            flex items-center justify-center
            ring-[1.5px] ring-white/80 dark:ring-[#0b0e1c]
          "
        >
          11
        </span>
      </motion.button>
    </div>
  );
}
