"use client";

import { useState } from "react";
import { Send, ChevronLeft } from "lucide-react";

// --- Sample Groups & Messages ---
const groups = [
  {
    id: 1,
    name: "Team Alpha",
    messages: [
      { id: 1, sender: "Alice", content: "Hey team!", time: "10:00 AM" },
      { id: 2, sender: "Bob", content: "Good morning!", time: "10:01 AM" },
    ],
  },
  {
    id: 2,
    name: "Project Beta",
    messages: [
      { id: 1, sender: "Charlie", content: "Meeting at 3 PM.", time: "9:30 AM" },
    ],
  },
];

export default function ChatPage() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  // --- Handle window resize for mobile responsiveness ---
  if (typeof window !== "undefined") {
    window.onresize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
  }

  // --- Send Message ---
  const handleSend = () => {
    if (!messageInput.trim()) {
      alert("Message cannot be empty!");
      return;
    }
    if (selectedGroup) {
      const newMessage = {
        id: selectedGroup.messages.length + 1,
        sender: "You",
        content: messageInput,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      selectedGroup.messages.push(newMessage);
      setSelectedGroup({ ...selectedGroup });
      setMessageInput("");
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* --- Desktop Left Panel --- */}
      {!isMobileView && (
        <div className="w-80 bg-white/70 backdrop-blur-xl shadow-lg flex-shrink-0">
          <h2 className="text-xl font-bold p-4 border-b border-gray-200">Chats</h2>
          <ul>
            {groups.map((group) => (
              <li
                key={group.id}
                className="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                onClick={() => setSelectedGroup(group)}
              >
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  {group.name[0]}
                </div>
                <span className="font-semibold">{group.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- Chat Area --- */}
      <div className="flex-1 flex flex-col relative">
        {/* --- Mobile: Show Group List first --- */}
        {isMobileView && !selectedGroup && (
          <div className="w-full">
            <h2 className="text-xl font-bold p-4 border-b border-gray-200">Chats</h2>
            <ul>
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    {group.name[0]}
                  </div>
                  <span className="font-semibold">{group.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --- Messages --- */}
        {selectedGroup && (
          <div className="flex flex-col h-[00px]">
            {/* Mobile Back Button */}
            {isMobileView && (
              <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-white/70 backdrop-blur-xl shadow-sm">
                <button onClick={() => setSelectedGroup(null)}>
                  <ChevronLeft size={24} />
                </button>
                <h2 className="font-bold">{selectedGroup.name}</h2>
              </div>
            )}

            {/* Message List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {selectedGroup.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-xs break-words ${
                      msg.sender === "You"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span className="text-xs text-gray-500 mt-1 block text-right">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-gray-200 bg-white/70 backdrop-blur-xl shadow-sm flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition"
                onClick={handleSend}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}