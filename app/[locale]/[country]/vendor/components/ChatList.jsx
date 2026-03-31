"use client";

import { useRouter, useParams, usePathname } from "next/navigation";

const groups = [
  {
    id: 1,
    name: "Team Alpha",
    lastMessage: "Hey team!",
    time: "10:45 AM",
    unread: 3,
    online: true,
    typing: false,
    pinned: true,
  },
  {
    id: 2,
    name: "Project Beta",
    lastMessage: "Meeting at 3 PM",
    time: "09:30 AM",
    unread: 1,
    online: false,
    typing: true,
    pinned: false,
  },
];

export default function ChatList() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const basePath = `/${params?.locale}/${params?.country}/vendor/chat`;

  // 📌 sort pinned first
  const sortedGroups = [...groups].sort((a, b) => b.pinned - a.pinned);

  return (
    <div className="h-full flex flex-col bg-white">

      {/* HEADER */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto">

        {sortedGroups.map((group) => {
          const isActive = pathname.includes(`/${group.id}`);

          return (
            <div
              key={group.id}
              onClick={() => router.push(`${basePath}/${group.id}`)}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition border-b border-b-gray-200 border-gray-100
                ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}
              `}
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">

                {/* Avatar + Online */}
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white flex items-center justify-center font-semibold p-2">
                    {group.name[0]}
                  </div>

                  {/* 🟢 Online */}
                  {group.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* TEXT */}
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {group.name}
                  </p>

                  {/* ✍️ Typing OR last message */}
                  {group.typing ? (
                    <p className="text-xs text-green-500 italic">
                      typing...
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 truncate">
                      {group.lastMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-end gap-1">

                {/* 🕒 Time */}
                <span className="text-xs text-gray-400">
                  {group.time}
                </span>

                <div className="flex items-center gap-1">

                  {/* 📌 Pin */}
                  {group.pinned && (
                    <span className="text-gray-400 text-xs">📌</span>
                  )}

                  {/* 🔴 Unread */}
                  {group.unread > 0 && (
                    <span className="min-w-[20px] h-5 px-1 text-xs flex items-center justify-center rounded-full bg-green-500 text-white">
                      {group.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}