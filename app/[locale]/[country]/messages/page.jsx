"use client";

/* ══════════════════════════════════════════════════════════════════
   MESSAGES PAGE — Full Dedicated Inbox
   ─────────────────────────────────────
   Airbnb/Linear-inspired communication center for hospitality CRM.

   Layout:
     Desktop : Left sidebar (conversation list) + Right panel (chat)
     Tablet  : Adaptive split — sidebar collapses at md breakpoint
     Mobile  : Stacked — list screen → tap → full chat screen

   URL pattern (consistent with Reservations):
     ?conversation=<id>  → active conversation

   No modal, no popover, no dropdown — this is a dedicated full page.

   NOTE: the avatar/name row + venue/booking context strip are rendered
   together as ONE seamless header inside ChatThread.jsx (see that file)
   so they read as a single connected block, not two stacked cards. This
   page only owns the page-level PageHeader (title/subtitle/unread badge)
   above the inbox — it does not duplicate the booking context card.
══════════════════════════════════════════════════════════════════ */

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";

import PageHeader         from "./components/PageHeader";
import ConversationList   from "./components/ConversationList";
import ChatThread         from "./components/ChatThread";
import { MOCK_CONVERSATIONS } from "./_data";

import { all_messages, send_messages } from '@/services/chat.service'
import { useRealtime } from "@/context/RealtimeContext";

/* ── Empty state (desktop: no conversation selected) ─────────────── */
function EmptyConversationState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-violet-100 blur-xl opacity-50" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/20">
          <MessageCircle className="h-8 w-8 text-violet-600 dark:text-violet-400" />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[15px] font-semibold text-gray-800 dark:text-gray-200">
          Select a conversation
        </p>
        <p className="max-w-[220px] text-[13px] leading-relaxed text-gray-400 dark:text-gray-500">
          Choose a thread from the sidebar to start messaging.
        </p>
      </div>
    </div>
  );
}

/* ── Inner page — requires Suspense for useSearchParams ──────────── */
function MessagesInner() {
  const t            = useTranslations("vendor.messages");
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  const [chats, setChat]   = useState([]);
  const [loading, setLoading] = useState(true);
  const activeId = searchParams.get("conversation");

  // Messages for the currently open thread. Kept separate from `chats` so a
  // realtime refetch of one conversation's messages doesn't require
  // reshaping/merging the whole sidebar list.
  const [activeMessages, setActiveMessages] = useState(null);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const { refreshKey, realtime, socket } = useRealtime();

  // Backend records may key on `_id` (Mongo-style) instead of `id` — match
  // either so a real API payload doesn't silently fail to resolve the
  // active conversation.
  const activeConv =
    chats.find((c) => String(c.id ?? c._id) === activeId) ?? null;

  const totalUnread = chats.reduce((sum, c) => sum + (c.unread || 0), 0);

  const fetchChats = useCallback(async () => {
    try {
      const res = await all_messages();
      setChat(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load, plus refetch whenever a realtime event bumps refreshKey
  // (e.g. new conversation, updated unread counts).
  useEffect(() => {
    fetchChats();
  }, [refreshKey, fetchChats]);

  /* Navigate to a conversation — preserves other search params */
  const handleSelect = useCallback(
    (id) => {
      const p = new URLSearchParams(searchParams);
      p.set("conversation", id);
      router.push(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  /* Back to conversation list (mobile) */
  const handleBack = useCallback(() => {
    const p = new URLSearchParams(searchParams);
    p.delete("conversation");
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const MessageClick = useCallback(async (formData) => {
    const res = await send_messages(formData);
    // Optimistically pull the thread forward immediately after sending,
    // rather than waiting on the next realtime event.
    if (activeId) {
      try {
        const fresh = await all_messages({ conversation_id: activeId });
        setActiveMessages(fresh?.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    return res;
  }, [activeId]);

  // Refetch the OPEN thread's messages whenever a realtime event fires or
  // the user switches conversations. Previously this call's result was
  // discarded, so incoming messages never actually reached ChatThread —
  // that's the "realtime not refreshing" bug. Now it's stored in
  // `activeMessages` and passed down below.
  useEffect(() => {
    if (!activeId) {
      setActiveMessages(null);
      return;
    }

    let cancelled = false;
    setMessagesLoading(true);

    all_messages({ conversation_id: activeId })
      .then((res) => {
        if (!cancelled) setActiveMessages(res?.data?.data || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey, activeId]);

  return (
    <div className="flex h-[calc(100dvh-120px)] flex-col bg-gray-50 dark:bg-gray-900">

      <div className="px-4 sm:px-6 md:px-8 lg:px-10 pb-4 shrink-0">
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          badge={
            totalUnread > 0 ? (
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-violet-600 px-1.5 text-[11px] font-bold text-white">
                {totalUnread}
              </span>
            ) : undefined
          }
        />
      </div>

      <div
        className="
          flex-1 min-h-0
          mx-0 md:mx-4 lg:mx-6
          mb-0 md:mb-4
          flex overflow-hidden
          border-t border-gray-100 dark:border-gray-800
          md:rounded-2xl md:border md:shadow-sm
          bg-white dark:bg-gray-950
        "
      >
        <aside
          className={[
            "flex flex-col border-r border-gray-100 dark:border-gray-800",
            "bg-white dark:bg-gray-950",
            "md:w-[340px] lg:w-[380px] md:flex-none md:flex",
            activeId ? "hidden" : "flex w-full",
          ].join(" ")}
        >
          <ConversationList
            conversations={chats}
            activeId={activeId}
            onSelect={handleSelect}
            loading={loading}
          />
        </aside>

        <section
          className={[
            "flex-1 flex flex-col min-w-0",
            "bg-white dark:bg-gray-950",
            activeId ? "flex" : "hidden md:flex",
          ].join(" ")}
        >
          {activeConv ? (
            <ChatThread
              conversation={activeConv}
              messages={activeMessages ?? activeConv.messages ?? []}
              messagesLoading={messagesLoading}
              onBack={handleBack}
              SendMessageApi={MessageClick}
            />
          ) : (
            <EmptyConversationState />
          )}
        </section>
      </div>
    </div>
  );
}

/* ── Main export — Suspense boundary required for useSearchParams ── */
export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-120px)] items-center justify-center">
          Loading...
        </div>
      }
    >
      <MessagesInner />
    </Suspense>
  );
}