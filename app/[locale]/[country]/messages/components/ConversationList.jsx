"use client";

/**
 * ConversationList (customer)
 * ──────────────────────────────────────────────────────────────────
 * Left sidebar for the guest-facing Messages page. Mirrors the vendor
 * inbox ergonomics, but categories and copy are customer-oriented and
 * fully driven by next-intl (`messages` namespace) — no hardcoded UI text.
 */

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Search, Pin, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { MESSAGE_CATEGORIES, CATEGORY_STYLES } from "../_data";

/* ── Category pill ─────────────────────────────────────────────── */
function CategoryPill({ category }) {
  const t = useTranslations("messages");
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.support;
  return (
    <span className={`inline-flex items-center text-[10px] md:text-[11px] font-semibold px-1.5 py-0.5 md:px-2 md:py-[3px] rounded-full leading-none ${style.pill}`}>
      {t(`categories.${category}`)}
    </span>
  );
}

/* ── Conversation card ─────────────────────────────────────────── */
function ConversationCard({ conv, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-start gap-3 px-4 py-3.5 md:px-5 md:py-4 text-start transition-colors",
        "border-b border-gray-50 dark:border-gray-900/80",
        isActive
          ? "bg-violet-50/80 dark:bg-violet-950/25 border-s-2 border-s-violet-500 dark:border-s-violet-400 ps-[14px] md:ps-[18px]"
          : "hover:bg-gray-50/80 dark:hover:bg-white/[0.025]",
      ].join(" ")}
    >
      {/* Avatar + online dot */}
      <div className="relative shrink-0 mt-0.5">
        <div
          className={`w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br ${conv.contact.color} flex items-center justify-center text-[11px] md:text-[12px] font-bold text-white shadow-sm`}
        >
          {conv.contact.initials}
        </div>
        <span
          aria-hidden="true"
          className={[
            "absolute bottom-0 end-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ring-2 ring-white dark:ring-gray-950",
            conv.contact.isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600",
          ].join(" ")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: name + time */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className={`text-[13px] md:text-[14px] font-semibold truncate leading-snug ${
              conv.unread > 0
                ? "text-gray-900 dark:text-gray-50"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {conv.contact.name}
          </span>
          <span className="text-[11px] md:text-[12px] text-gray-400 dark:text-gray-500 shrink-0 leading-none">
            {conv.time}
          </span>
        </div>

        {/* Row 2: venue / subject */}
        {(conv.venue || conv.subject) && (
          <p className="text-[11px] md:text-[12px] text-gray-400 dark:text-gray-500 truncate mb-1 leading-snug">
            {conv.venue ?? conv.subject}
          </p>
        )}

        {/* Row 3: last message + unread badge */}
        <div className="flex items-end justify-between gap-2">
          <p
            className={`text-[12px] md:text-[13px] truncate leading-snug ${
              conv.unread > 0
                ? "text-gray-700 dark:text-gray-300 font-medium"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {conv.lastMessage}
          </p>
          {conv.unread > 0 && (
            <span className="shrink-0 flex h-5 min-w-[20px] md:h-[22px] md:min-w-[22px] items-center justify-center rounded-full bg-violet-600 dark:bg-violet-500 px-1.5 text-[9px] md:text-[10px] font-bold text-white leading-none">
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
  const t = useTranslations("messages");
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("all");

  /* ── Category tab scroll state ──────────────────────────────── */
  const tabsRef        = useRef(null);
  const [showLeft,  setShowLeft]  = useState(false);
  const [showRight, setShowRight] = useState(false);

  const syncArrows = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    /* Direction-agnostic: use magnitude so RTL (negative scrollLeft) works too */
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setShowLeft(pos > 4);
    setShowRight(pos < max - 4);
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

  const scrollStart = () => tabsRef.current?.scrollBy({ left: -110, behavior: "smooth" });
  const scrollEnd   = () => tabsRef.current?.scrollBy({ left:  110, behavior: "smooth" });

  /* Total unread across all conversations */
  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unread || 0), 0),
    [conversations],
  );

  /* Per-category unread counts */
  const categoryUnread = useMemo(() => {
    const map = { all: totalUnread };
    MESSAGE_CATEGORIES.forEach((key) => {
      if (key === "all") return;
      map[key] = conversations
        .filter((c) => c.category === key)
        .reduce((s, c) => s + (c.unread || 0), 0);
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
          (c.subject && c.subject.toLowerCase().includes(q)) ||
          (c.venue && c.venue.toLowerCase().includes(q)) ||
          c.lastMessage.toLowerCase().includes(q),
      );
    }

    /* Pinned first, then original (already time-sorted) order */
    return [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [conversations, category, search]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] md:text-[17px] font-semibold text-gray-900 dark:text-gray-100">
            {t("title")}
          </h2>
          {totalUnread > 0 && (
            <span className="flex h-5 min-w-[20px] md:h-6 md:min-w-[24px] items-center justify-center rounded-full bg-violet-600 dark:bg-violet-500 px-1.5 text-[10px] md:text-[11px] font-bold text-white leading-none">
              {totalUnread}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none md:w-[15px] md:h-[15px]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="
              w-full ps-8 pe-3 py-2 md:py-2.5 text-[13px] md:text-[14px] rounded-xl
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

        {showLeft && (
          <div className="pointer-events-none absolute inset-y-0 start-0 z-10 flex items-center ps-0.5">
            {/* Edge fade — narrow, sits behind the button so it never washes out tab content */}
            <div className="absolute inset-y-0 start-0 w-8 bg-gradient-to-r from-white dark:from-gray-950 to-transparent" />

            {/* Glass arrow button — has its own background/ring/shadow so it stays legible over any tab or badge */}
            <button
              type="button"
              onClick={scrollStart}
              aria-label="Scroll tabs start"
              className="
                pointer-events-auto relative z-10 flex h-6 w-6 items-center justify-center
                rounded-full transition-all duration-150
                bg-white/90 dark:bg-gray-900/90 backdrop-blur-md
                ring-1 ring-gray-200/80 dark:ring-white/[0.10]
                shadow-[0_2px_8px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.40)]
                hover:bg-white dark:hover:bg-gray-800 hover:ring-violet-300/60 dark:hover:ring-violet-500/30
                active:scale-90
              "
            >
              <ChevronLeft size={12} className="text-gray-500 dark:text-gray-400 rtl:rotate-180" />
            </button>
          </div>
        )}

        {/* Scrollable tab strip */}
        <div
          ref={tabsRef}
          className="
            flex overflow-x-auto
            [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
          "
        >
          {MESSAGE_CATEGORIES.map((key) => {
            const isActive  = key === category;
            const catUnread = categoryUnread[key] ?? 0;
            return (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={[
                  "relative flex items-center gap-1.5 px-3 py-2.5 md:px-3.5 md:py-3 text-[12px] md:text-[13px] font-medium",
                  "whitespace-nowrap shrink-0 border-b-2 -mb-px transition-colors",
                  "outline-none focus-visible:ring-1 focus-visible:ring-violet-500",
                  isActive
                    ? "text-violet-700 dark:text-violet-300 border-violet-600 dark:border-violet-400"
                    : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-gray-200",
                ].join(" ")}
              >
                {t(`categories.${key}`)}
                {catUnread > 0 && (
                  <span className="flex h-4 min-w-[16px] md:h-[18px] md:min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] md:text-[10px] font-bold text-white leading-none">
                    {catUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {showRight && (
          <div className="pointer-events-none absolute inset-y-0 end-0 z-10 flex items-center pe-0.5">
            {/* Edge fade — narrow, sits behind the button so it never washes out tab content */}
            <div className="absolute inset-y-0 end-0 w-8 bg-gradient-to-l from-white dark:from-gray-950 to-transparent" />

            {/* Glass arrow button — has its own background/ring/shadow so it stays legible over any tab or badge */}
            <button
              type="button"
              onClick={scrollEnd}
              aria-label="Scroll tabs end"
              className="
                pointer-events-auto relative z-10 flex h-6 w-6 items-center justify-center
                rounded-full transition-all duration-150
                bg-white/90 dark:bg-gray-900/90 backdrop-blur-md
                ring-1 ring-gray-200/80 dark:ring-white/[0.10]
                shadow-[0_2px_8px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.40)]
                hover:bg-white dark:hover:bg-gray-800 hover:ring-violet-300/60 dark:hover:ring-violet-500/30
                active:scale-90
              "
            >
              <ChevronRight size={12} className="text-gray-500 dark:text-gray-400 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* ── Conversation list ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto md:pb-0 pb-[76px] [scrollbar-width:thin] [scrollbar-color:theme(colors.gray.200)_transparent] dark:[scrollbar-color:theme(colors.gray.800)_transparent]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 px-6 text-center">
            <Search size={20} className="text-gray-300 dark:text-gray-700" />
            <p className="text-[13px] text-gray-400 dark:text-gray-500">
              {t("noConversations")}
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
