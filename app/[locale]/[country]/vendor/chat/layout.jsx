"use client";

import ChatList from "../components/ChatList";
import { usePathname } from "next/navigation";

export default function ChatLayout({ children }) {
  const pathname = usePathname();
  const isChatPage = pathname.includes("/vendor/chat/");

  return (
  <div className=" flex overflow-hidden bg-gray-50">

  {/* LEFT */}
  <div className="hidden md:flex w-80 bg-white border-r flex-col min-h-0">
    <ChatList />
  </div>

  {/* RIGHT */}
  <div className="flex-1 flex flex-col min-h-0">
    {children}
  </div>

</div>
  );
}