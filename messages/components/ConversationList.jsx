"use client";

/**
 * ConversationList
 * ──────────────────────────────────────────────────────────────────
 * Left sidebar panel for the Messages page.
 *
 * Features:
 *   • Search bar — filters by name, venue, subject, last message
 *   • Category tabs — All / Guests / Leads / Bookings / Team / Support / System
 *   • Conversation cards — avatar + online dot, name, venue, last message,
 *     unread badge, category chip, timestamp
 *   • Pinned conversations sort to the top
 *   • Active conversation highlighted in violet
 *   • Dark mode + RTL safe
 */

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Search, Pin, ChevronLeft, ChevronRight } from "lucide-react";
import { MOCK_CATEGORIES, CATEGORY_STYLES } from "../_data";

/* ── Category pill ─────────────────────────────────────────────── */
function CategoryPill({ category }) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.system;
  const label = MOCK_CATEGORIES.find((c) => c.key === category)?.label ?? category;
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${style.pill}`}>
      {label}
    </span>
  );
}

/* ── Conversation card ─────────────────────────────────────────── */
function ConversationCard({ conv, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors",
        "border-b border-gray-50 dark:border-gray-900/80",
        isActive
          ? "bg-violet-50/80 dark:bg-violet-950/25 border-l-2 border-l-violet-500 dark:border-l-violet-400 pl-[14px]"
          : "hover:bg-gray-50/80 dark:hover:bg-white/[0.025]",
      ].join(" ")}
    >
      {/* Avatar + online dot */}
      <div className="relative shrink-0 mt-0.5">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${conv.contact.color} flex items-center justify-center text-[11px] font-bold text-white shadow-sm`}
        >
          {conv.contact.initials}
        </div>
        {conv.contact.isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-950" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: name + time */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className={`text-[13px] font-semibold truncate leading-snug ${
              conv.unread > 0
                ? "text-gray-900 dark:text-gray-50"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {conv.contact.name}
          </span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0 leading-none">
            {conv.time}
          </span>
        </div>

        {/* Row 2: venue */}
        {conv.venue && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mb-1 leading-snug">
            {conv.venue}
          </p>
        )}

        {/* Row 3: last message + unread badge */}
        <div className="flex items-end justify-between gap-2">
          <p
            className={`text-[12px] truncate leading-snug ${
              conv.unread > 0
                ? "text-gray-700 dark:text-gray-300 font-medium"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {conv.lastMessage}
          </p>
          {conv.unread > 0 && (
            <span className="shrink-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-violet-600 dark:bg-violet-500 px-1.5 text-[9px] font-bold text-white leading-none">
              {conv.unread}
            </span>
          )}
        </div>

        {/* Row 4: category chip + pin */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <CategoryPill category={conv.category} />
          {conv.pinned && (
            <Pin size={9} className="text-gray-300 dark:text-gray-600 fill-current" />
          )}
        </div>
      </div>
    </button>
  );
}

/* ── Main component ────────────────────────────────────────────── */
export default function ConversationList({ conversations, activeId, onSelect }) {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("all");

  /* ── Category tab scroll state ──────────────────────────────── */
  const tabsRef        = useRef(null);
  const [showLeft,  setShowLeft]  = useState(false);
  const [showRight, setShowRight] = useState(false);

  const syncArrows = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    syncArrows();
    el.addEventListener("scroll", syncArrows, { passive: true });
    const obs = new ResizeObserver(syncArrows);
    obs.observe(el);
    return () => { el.removeEventListener("scroll", syncArrows); obs.disconnect(); };
  }, [syncArrows]);

  const scrollLeft  = () => tabsRef.current?.scrollBy({ left: -110, behavior: "smooth" });
  const scrollRight = () => tabsRef.current?.scrollBy({ left:  110, behavior: "smooth" });

  /* Total unread across all conversations */
  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread, 0),
    [conversations],
  );

  /* Per-category unread counts */
  const categoryUnread = useMemo(() => {
    const map = { all: totalUnread };
    MOCK_CATEGORIES.forEach((cat) => {
      if (cat.key === "all") return;
      map[cat.key] = conversations
        .filter((c) => c.category === cat.key)
        .reduce((s, c) => s + c.unread, 0);
    });
    return map;
  }, [conversations, totalUnread]);

  /* Filtered + sorted list */
  const filtered = useMemo(() => {
    let list = conversations;

    if (category !== "all") {
      list = list.filter((c) => c.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.contact.name.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          (c.venue && c.venue.toLowerCase().includes(q)) ||
          c.lastMessage.toLowerCase().includes(q),
      );
    }

    /* Pinned first, then by implicit order (already time-sorted in data) */
    return [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [conversations, category, search]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
            Inbox
          </h2>
          {totalUnread > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-violet-600 dark:bg-violet-500 px-1.5 text-[10px] font-bold text-white leading-none">
              {totalUnread}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="
              w-full pl-8 pr-3 py-2 text-[13px] rounded-xl
              bg-gray-50 dark:bg-gray-900
              border border-gray-100 dark:border-gray-800
              text-gray-900 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-600
              outline-none focus:ring-1 focus:ring-violet-400 dark:focus:ring-violet-500
              transition
            "
          />
        </div>
      </div>

      {/* ── Category Tabs — with overflow scroll arrows ─────────── */}
      <div className="relative shrink-0 border-b border-gray-100 dark:border-gray-800">

        {/* Left arrow — fades in when scrolled right */}
        {showLeft && (
          <button
            onClick={scrollLeft}
            aria-label="Scroll tabs left"
            className="
              absolute left-0 top-0 bottom-0 z-10
              flex items-center justify-center
              w-8 pl-0.5
              bg-gradient-to-r from-white dark:from-gray-950 to-transparent
            "
          >
            <ChevronLeft size={14} className="text-gray-400 dark:text-gray-500" />
          </button>
        )}

        {/* Scrollable tab strip */}
        <div
          ref={tabsRef}
          className="
            flex overflow-x-auto
            [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
          "
        >
          {MOCK_CATEGORIES.map((cat) => {
            const isActive  = cat.key === category;
            const catUnread = categoryUnread[cat.key] ?? 0;
            return (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={[
                  "relative flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium",
                  "whitespace-nowrap shrink-0 border-b-2 -mb-px transition-colors",
                  "outline-none focus-visible:ring-1 focus-visible:ring-violet-500",
                  isActive
                    ? "text-violet-700 dark:text-violet-300 border-violet-600 dark:border-violet-400"
                    : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-gray-200",
                ].join(" ")}
              >
                {cat.label}
                {catUnread > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none">
                    {catUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right arrow — fades in when more tabs are to the right */}
        {showRight && (
          <button
            onClick={scrollRight}
            aria-label="Scroll tabs right"
            className="
              absolute right-0 top-0 bottom-0 z-10
              flex items-center justify-center
              w-8 pr-0.5
              bg-gradient-to-l from-white dark:from-gray-950 to-transparent
            "
          >
            <ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />
          </button>
        )}
      </div>

      {/* ── Conversation list ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto md:pb-0 pb-[76px] [scrollbar-width:thin] [scrollbar-color:theme(colors.gray.200)_transparent] dark:[scrollbar-color:theme(colors.gray.800)_transparent]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 px-6 text-center">
            <Search size={20} className="text-gray-300 dark:text-gray-700" />
            <p className="text-[13px] text-gray-400 dark:text-gray-500">
              No conversations found
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationCard
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeId}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
