"use client";

/**
 * ChatThread
 * ──────────────────────────────────────────────────────────────────
 * Right panel — renders the full message thread for an active
 * conversation plus the composer.
 *
 * Features:
 *   • Sticky header with back button (mobile), avatar, status, actions
 *   • Messages grouped by date with dividers
 *   • Outgoing bubbles (violet) / incoming bubbles (gray)
 *   • Avatar shown for first message in each incoming group
 *   • Sender name shown for group-style conversations
 *   • Animated typing indicator (3-dot bounce)
 *   • Simulated reply after send for demo purposes
 *   • File attachment preview + send
 *   • Send on Enter (Shift+Enter for newline)
 *   • Scroll-to-bottom on new messages
 *   • Dark mode + RTL safe
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, Paperclip, Send, MoreHorizontal, Info, X, Building2, Calendar, Hash, CheckCircle2, Clock4 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

/* ── Typing dots animation ─────────────────────────────────────── */
function TypingIndicator({ contact }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
      className="flex items-end gap-2 mt-3"
    >
      <div
        className={`w-7 h-7 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}
      >
        {contact.initials}
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Single message bubble ─────────────────────────────────────── */
function MessageBubble({ msg, contact, isContinuation }) {
  const isMe = msg.role === "me";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${isMe ? "justify-end" : "justify-start"} ${isContinuation ? "mt-0.5" : "mt-3"}`}
    >
      {/* Avatar for incoming (only on first in a group) */}
      {!isMe && (
        <div className="w-7 h-7 shrink-0 me-2 self-end">
          {!isContinuation ? (
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center text-[9px] font-bold text-white`}
            >
              {msg.sender ? msg.sender[0] : contact.initials}
            </div>
          ) : null}
        </div>
      )}

      {/* Bubble + meta */}
      <div className={`max-w-[72%] sm:max-w-[60%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
        {/* Sender name (group chats / team) */}
        {!isMe && msg.sender && !isContinuation && (
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 ms-1">
            {msg.sender}
          </span>
        )}

        {/* Bubble */}
        <div
          className={[
            "px-3.5 py-2.5 text-[13px] leading-relaxed break-words",
            isMe
              ? "bg-violet-600 dark:bg-violet-500 text-white rounded-2xl rounded-br-[6px] shadow-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-[6px]",
          ].join(" ")}
        >
          {msg.text}
          {msg.file && (
            <img
              src={msg.file.preview}
              alt="Attachment"
              className="mt-2 max-w-full rounded-xl"
            />
          )}
        </div>

        {/* Timestamp + delivery status */}
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {msg.time}
          </span>
          {isMe && (
            <span className={`text-[10px] ${msg.status === "seen" ? "text-violet-400 dark:text-violet-400" : "text-gray-400 dark:text-gray-500"}`}>
              {msg.status === "sent"      && "✓"}
              {msg.status === "delivered" && "✓✓"}
              {msg.status === "seen"      && "✓✓"}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main component ────────────────────────────────────────────── */
export default function ChatThread({ conversation: conv, onBack }) {
  const t = useTranslations("messages");
  const [messages,    setMessages]    = useState(conv.messages);
  const [input,       setInput]       = useState("");
  const [isTyping,    setIsTyping]    = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  /* Reset state when conversation changes */
  useEffect(() => {
    setMessages(conv.messages);
    setInput("");
    setFilePreview(null);
    setIsTyping(false);
  }, [conv.id]);

  /* Scroll to bottom whenever messages update */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* Auto-resize textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [input]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text && !filePreview) return;

    const newMsg = {
      id:     `msg_${Date.now()}`,
      role:   "me",
      text,
      time:   new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date:   "Today",
      file:   filePreview,
      status: "sent",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setFilePreview(null);

    /* Simulate delivery ticks */
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: "delivered" } : m)),
      );
    }, 700);

    /* Simulate typing + reply */
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id:     `msg_${Date.now() + 1}`,
          role:   "them",
          sender: conv.category === "support" ? "Support" : "Host",
          text:   "Thanks for your message! We'll get back to you shortly.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: "Today",
        },
      ]);
    }, 1800);
  }, [input, filePreview, conv.category]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilePreview({ name: file.name, preview: URL.createObjectURL(file) });
    e.target.value = "";
  };

  /* Group messages by date */
  const grouped = messages.reduce((acc, msg) => {
    const d = msg.date ?? "Today";
    if (!acc[d]) acc[d] = [];
    acc[d].push(msg);
    return acc;
  }, {});

  const canSend = input.trim().length > 0 || !!filePreview;
  const showContext = conv.venue && ["bookings", "enquiries"].includes(conv.category);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/98 dark:bg-gray-950/98 backdrop-blur-sm">

        {/* Back button — mobile only */}
        <button
          onClick={onBack}
          aria-label="Back to conversations"
          className="md:hidden flex items-center justify-center w-8 h-8 -ms-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
        >
          <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400 rtl:rotate-180" />
        </button>

        {/* Avatar + online dot */}
        <div className="relative shrink-0">
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${conv.contact.color} flex items-center justify-center text-[11px] font-bold text-white shadow-sm`}
          >
            {conv.contact.initials}
          </div>
          <span
            aria-hidden="true"
            className={[
              "absolute bottom-0 end-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-gray-950",
              conv.contact.isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600",
            ].join(" ")}
          />
        </div>

        {/* Name + venue/subject — category is already shown on the inbox
            row and, where relevant, in the context card below, so it
            isn't repeated here. */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate">
              {conv.contact.name}
            </p>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate leading-tight mt-0.5">
            {conv.contact.isOnline ? t("online") : (conv.venue ?? conv.subject)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            aria-label="Conversation info"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Info size={15} className="text-gray-400 dark:text-gray-500" />
          </button>
          <button
            aria-label="More options"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MoreHorizontal size={15} className="text-gray-400 dark:text-gray-500" />
          </button>
        </div>
      </div>

      {/* ── Booking / Lead context card ────────────────────────── */}
      {/*
        Shown only for guest / lead / booking conversations that have
        a venue attached. Team, Support and System threads skip this.
        Gives the vendor instant context: venue, event, ref, status.
      */}
      {showContext && (
        <div className="shrink-0 px-4 py-2.5 bg-violet-50/70 dark:bg-violet-950/20 border-b border-violet-100 dark:border-violet-900/40">
          <div className="flex items-start gap-3">

            {/* Left: venue + event info */}
            <div className="flex-1 min-w-0 space-y-[3px]">
              {/* Venue */}
              <div className="flex items-center gap-1.5">
                <Building2 size={11} className="text-violet-400 dark:text-violet-500 shrink-0" />
                <span className="text-[11.5px] font-semibold text-violet-700 dark:text-violet-300 truncate">
                  {conv.venue}
                </span>
              </div>
              {/* Subject / event */}
              <div className="flex items-center gap-1.5">
                <Calendar size={11} className="text-violet-300 dark:text-violet-600 shrink-0" />
                <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {conv.subject}
                </span>
              </div>
              {/* Booking ref — derived from subject if it contains # */}
              {conv.subject?.includes("#") && (
                <div className="flex items-center gap-1.5">
                  <Hash size={11} className="text-violet-300 dark:text-violet-600 shrink-0" />
                  <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 truncate">
                    {conv.subject.match(/#[\w-]+/)?.[0] ?? ""}
                  </span>
                </div>
              )}
            </div>

            {/* Right: status badge */}
            <div className="shrink-0 mt-0.5">
              {conv.category === "bookings" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                  <CheckCircle2 size={9} strokeWidth={2.5} />
                  {t("categories.bookings")}
                </span>
              )}
              {conv.category === "enquiries" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                  <Clock4 size={9} strokeWidth={2.5} />
                  {t("categories.enquiries")}
                </span>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Messages area ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin] [scrollbar-color:theme(colors.gray.200)_transparent] dark:[scrollbar-color:theme(colors.gray.800)_transparent]">

        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4 first:mt-0">
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              <span className="text-[10.5px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap bg-white dark:bg-gray-950 px-2">
                {date}
              </span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </div>

            {/* Bubbles */}
            {msgs.map((msg, idx) => {
              const prevMsg        = msgs[idx - 1];
              const isContinuation = prevMsg?.role === msg.role;
              return (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  contact={conv.contact}
                  isContinuation={isContinuation}
                />
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <TypingIndicator key="typing" contact={conv.contact} />
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* ── File preview strip ──────────────────────────────────── */}
      <AnimatePresence>
        {filePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="shrink-0 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3"
          >
            <img
              src={filePreview.preview}
              alt=""
              className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
            />
            <span className="flex-1 text-[12px] text-gray-600 dark:text-gray-400 truncate">
              {filePreview.name}
            </span>
            <button
              onClick={() => setFilePreview(null)}
              className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400"
              aria-label="Remove file"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Composer ────────────────────────────────────────────── */}
      {/* No reserved space for BottomMenu — it's hidden whenever this
          full-screen thread view is on screen (see UIContext.hideSiteChrome). */}
      <div className="shrink-0 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] md:pb-3 border-t border-gray-100 dark:border-gray-800 bg-white/98 dark:bg-gray-950/98 backdrop-blur-sm">
        <div className="flex items-center gap-2">

          {/* Attach button */}
          <label
            aria-label={t("attach")}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
          >
            <Paperclip size={16} className="text-gray-400 dark:text-gray-500" />
            <input type="file" className="hidden" onChange={handleFile} accept="image/*,.pdf,.doc,.docx" />
          </label>

          {/* Text input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("typeMessage")}
              rows={1}
              className="
                w-full resize-none overflow-hidden
                rounded-2xl px-4 py-2.5
                text-[13px] leading-relaxed
                bg-gray-50 dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                text-gray-900 dark:text-gray-100
                placeholder:text-gray-400 dark:placeholder:text-gray-600
                outline-none focus:ring-1 focus:ring-violet-400 dark:focus:ring-violet-500
                transition
                [scrollbar-width:none]
              "
            />
          </div>

          {/* Send button */}
          <motion.button
            onClick={handleSend}
            disabled={!canSend}
            whileTap={canSend ? { scale: 0.88 } : {}}
            aria-label={t("send")}
            className={[
              "flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-all duration-150",
              canSend
                ? "bg-violet-600 dark:bg-violet-500 text-white shadow-sm hover:bg-violet-700 dark:hover:bg-violet-600 cursor-pointer"
                : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed",
            ].join(" ")}
          >
            <Send size={15} strokeWidth={2.2} className="rtl:-scale-x-100" />
          </motion.button>

        </div>
      </div>
    </div>
  );
}
