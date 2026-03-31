"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, Paperclip, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK DATA ---
const groups = [
  {
    id: 1,
    name: "Team Alpha",
    onlineUsers: ["Alice"],
    messages: [
      {
        id: 1,
        sender: "Alice",
        content: "Hey team!",
        time: new Date(),
      },
    ],
  },
  {
    id: 2,
    name: "Project Beta",
    onlineUsers: [],
    messages: [
      {
        id: 2,
        sender: "Charlie",
        content: "Meeting at 3 PM",
        time: new Date(),
      },
    ],
  },
];

export default function ChatPage() {
  const { id, locale, country } = useParams();
  const router = useRouter();
  const bottomRef = useRef(null);

  const groupData = groups.find((g) => g.id === Number(id));

  const [messages, setMessages] = useState(groupData?.messages || []);
  const [messageInput, setMessageInput] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (groupData) setMessages(groupData.messages);
  }, [id]);

  // --- FORMAT DATE ---
  const formatDate = (date) => new Date(date).toDateString();

  // --- GROUP BY DATE ---
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.time);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  // --- SCROLL ONLY WHEN SEND ---
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- SEND ---
  const handleSend = () => {
    if (!messageInput.trim() && !filePreview) return;

    const newMsg = {
      id: Date.now(),
      sender: "You",
      content: messageInput,
      file: filePreview,
      time: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageInput("");
    setFilePreview(null);

    scrollToBottom();

    // simulate ticks
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMsg.id ? { ...m, status: "delivered" } : m
        )
      );
    }, 800);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMsg.id ? { ...m, status: "seen" } : m
        )
      );
    }, 1500);

    // typing simulation
    setTypingUser("Alice");
    setTimeout(() => {
      setTypingUser(null);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "Alice",
          content: "Got it 👍",
          time: new Date(),
        },
      ]);
    }, 2000);
  };

  // --- FILE ---
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFilePreview({
      file,
      preview: URL.createObjectURL(file),
    });
  };

  // --- LOAD MORE ---
  const loadMore = () => {
    const older = [
      {
        id: Date.now(),
        sender: "Alice",
        content: "Old message...",
        time: new Date(Date.now() - 86400000),
      },
    ];
    setMessages((prev) => [...older, ...prev]);
    setPage((p) => p + 1);
  };

  if (!groupData) return <div className="p-4">Chat not found</div>;

  return (
<div className="h-full flex overflow-hidden bg-gray-100">
    

      {/* RIGHT CHAT */}
      <div className="flex flex-col flex-1 min-h-0">

        {/* HEADER */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-b-gray-200 bg-white">
          <button
            className="md:hidden"
            onClick={() =>
              router.push(`/${locale}/${country}/vendor/chat`)
            }
          >
            <ChevronLeft />
          </button>

          <div>
            <h2 className="font-semibold">{groupData.name}</h2>
            <p className="text-xs text-gray-500">
              {groupData.onlineUsers.length ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2">

          <div className="text-center mb-3">
            <button
              onClick={loadMore}
              className="text-xs bg-gray-200 px-3 py-1 rounded-full"
            >
              Load older messages
            </button>
          </div>

          {Object.keys(groupedMessages).map((date) => (
            <div key={date}>
              <div className="text-center text-xs text-gray-400 my-3">
                {date}
              </div>

              <AnimatePresence>
                {groupedMessages[date].map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.sender === "You"
                        ? "justify-end"
                        : "justify-start"
                    } mb-2`}
                  >
                    <div className="max-w-xs">
                      <div
                        className={`p-3 rounded-2xl shadow ${
                          msg.sender === "You"
                            ? "bg-blue-500 text-white"
                            : "bg-white"
                        }`}
                      >
                        {msg.content}
                        {msg.file && (
                          <img
                            src={msg.file.preview}
                            className="mt-2 rounded"
                          />
                        )}
                      </div>

                      <span className="text-xs flex justify-end gap-1 text-gray-400">
                        {new Date(msg.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}

                        {msg.sender === "You" && (
                          <>
                            {msg.status === "sent" && "✔"}
                            {msg.status === "delivered" && "✔✔"}
                            {msg.status === "seen" && (
                              <span className="text-blue-500">✔✔</span>
                            )}
                          </>
                        )}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))}

          {/* typing */}
          {typingUser && (
            <div className="text-sm text-gray-500">
              {typingUser} typing...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* FILE PREVIEW */}
        {filePreview && (
          <div className="px-4 py-2 bg-white border-t border-t-gray-200">
            <img src={filePreview.preview} className="w-12 h-12" />
          </div>
        )}

        {/* INPUT */}
        <div className="shrink-0 border-t  border-t-gray-200 bg-white p-3 flex gap-2">
          <label className="cursor-pointer">
            <Paperclip />
            <input type="file" hidden onChange={handleFile} />
          </label>

          <input
            className="flex-1 border  border-gray-200 rounded-full px-4 py-2"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type message..."
          />

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="bg-blue-500 text-white p-2 rounded-full"
            onClick={handleSend}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}