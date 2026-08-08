"use client";

/* ══════════════════════════════════════════════════════════════════
   CUSTOMER MESSAGES PAGE — Full Dedicated Inbox
   ─────────────────────────────────────────────
   Guest-facing communication center. Mirrors the vendor Messages UX
   (split-pane inbox + thread) from the customer's point of view.

   Layout:
     Desktop : Left sidebar (conversation list) + Right panel (chat)
     Tablet  : Adaptive split — sidebar collapses at md breakpoint
     Mobile  : Stacked — list screen → tap → full chat screen

   URL pattern:
     ?conversation=<id>  → active conversation

   The site navbar is fixed (h-16 / md:h-18). Customer routes own their
   top offset, so this page pads itself to sit just below the navbar and
   fills the remaining viewport height.
══════════════════════════════════════════════════════════════════ */

import { Suspense, useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageCircle, X } from "lucide-react";

import { useUI } from "@/context/UIContext";
import ConversationList from "./components/ConversationList";
import ChatThread       from "./components/ChatThread";
import { MOCK_CONVERSATIONS } from "./_data";

import { all_messages, send_messages, mark_read } from '@/services/chat.service'
import { useRealtime } from "@/context/RealtimeContext";

/* ── Empty state (desktop: no conversation selected) ─────────────── */
function EmptyConversationState() {
  const t = useTranslations("messages");
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center bg-gray-50/50 dark:bg-gray-950">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center shadow-sm">
          <MessageCircle size={28} className="text-violet-400 dark:text-violet-500" strokeWidth={1.5} />
        </div>
        <div className="absolute -inset-2 rounded-3xl border border-violet-100 dark:border-violet-900/40 pointer-events-none" />
      </div>

      <div>
        <p className="text-[15px] font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
          {t("selectConversation")}
        </p>
        <p className="text-[13px] text-gray-400 dark:text-gray-500 leading-relaxed max-w-[220px]">
          {t("selectConversationSub")}
        </p>
      </div>
    </div>
  );
}

/* ── Toast — new-message notification for background conversations ── */
function RealtimeToasts({ toasts, onDismiss, onOpen }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-[300px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-800 p-3 cursor-pointer"
          onClick={() => onOpen(toast.conversationId, toast.id)}
        >
          <div className="w-9 h-9 shrink-0 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center">
            <MessageCircle size={16} className="text-violet-500" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate">
              {toast.title}
            </p>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
              {toast.body}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(toast.id);
            }}
            className="shrink-0 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function getId(obj) {
  return String(obj?.id ?? obj?._id ?? "");
}

function extractMessages(data, conversationId) {
  if (!Array.isArray(data)) return [];
  if (data.length && Array.isArray(data[0]?.messages)) {
    const match = data.find((c) => getId(c) === String(conversationId));
    return match?.messages ?? [];
  }
  return data;
}

/* ── Inner page — requires Suspense for useSearchParams ──────────── */
function MessagesInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const { setHideSiteChrome } = useUI();

  const { refreshKey, realtime } = useRealtime();
  const [chats, setChat]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts]   = useState([]);

  /* Active conversation from URL */
  const activeId   = searchParams.get("conversation");
  const activeConv = chats.find((c) => String(c.id) === activeId) ?? null;

  /* Refs mirror the latest values so the realtime effect below can read
     them without depending on `activeId` / `chats` — depending on those
     directly would either re-subscribe the effect every time the URL or
     the conversation list changes (activeId), or worse, cause it to
     re-fire every time fetchChats() updates chats, which fetchChats()
     itself triggers — an infinite loop (chats). */
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const chatsRef = useRef(chats);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  /* ── Mobile full-screen thread detection ─────────────────────────
     Below md (768px), opening a conversation replaces the list with a
     full-screen chat. That view owns its own header (ChatThread), so the
     site Navbar + BottomMenu step aside — mirrors native chat apps. */
  const [isMobileWidth, setIsMobileWidth] = useState(false);

  useEffect(() => {
    const mql  = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobileWidth(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const isFullscreenThread = Boolean(activeId) && isMobileWidth;

  useEffect(() => {
    setHideSiteChrome(isFullscreenThread);
    return () => setHideSiteChrome(false);
  }, [isFullscreenThread, setHideSiteChrome]);

  /* Navigate to a conversation — preserves other search params.
     Uses replace (not push): switching conversations is in-page UI
     state, not a new navigable page. Pushing here would stack extra
     history entries under /messages, so the back button would have to
     step through every conversation ever opened before it could leave
     the page — replace keeps "previous route" meaning whatever the
     user was on before they entered Messages, not before they clicked
     into a specific conversation. */
  // const handleSelect = useCallback(
  //   (id) => {
  //     const p = new URLSearchParams(searchParams);
  //     p.set("conversation", id);
  //     router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  //   },
  //   [pathname, router, searchParams],
  // );
    const markThreadRead = useCallback(async (id) => {
    if (!id || typeof mark_read !== "function") return;
    try {
      await mark_read(id);
    } catch (err) {
      console.warn("mark_read failed (endpoint may not exist yet):", err);
    }
  }, []);
    const handleSelect = useCallback((id) => {
      const p = new URLSearchParams(searchParams);
      p.set("conversation", id);
      router.push(`${pathname}?${p.toString()}`, { scroll: false });
  
      setChat((prev) => prev.map((c) => (getId(c) === id ? { ...c, unread: 0 } : c)));
      setToasts((prev) => prev.filter((tst) => tst.conversationId !== id));
      markThreadRead(id);
    }, [pathname, router, searchParams, markThreadRead]);

  /* Back to conversation list (mobile) — same reasoning, replace only. */
  const handleBack = useCallback(() => {
    const p = new URLSearchParams(searchParams);
    p.delete("conversation");
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  /* Leave the Messages page entirely — back to wherever the user came
     from (e.g. account menu). Distinct from handleBack, which only
     drops the active conversation. */
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

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



  useEffect(() => {
    fetchChats();
  }, [refreshKey, fetchChats]);

  useEffect(() => {
    if (activeId) markThreadRead(activeId);
  }, [activeId, refreshKey, markThreadRead]);

  /* Incoming realtime message: refresh the list, and if it belongs to a
     conversation the user isn't currently looking at, surface a toast.
     Deliberately depends only on [realtime, fetchChats] — see the ref
     comment above for why activeId/chats are read via refs instead. */
  useEffect(() => {
    if (!realtime || realtime.kind !== "realtime") return;
    if (realtime.status === "loading") return;

    fetchChats();

    const convId = String(realtime.conversation_id ?? realtime.conversationId ?? "");
    if (convId && convId !== activeIdRef.current) {
      const source = chatsRef.current.find((c) => getId(c) === convId);
      setToasts((prev) => [
        ...prev,
        {
          id: `${convId}_${Date.now()}`,
          conversationId: convId,
          title: source?.venue ?? source?.contact?.name ?? "New message",
          body: realtime.message ?? "You have a new message",
        },
      ]);
    }
  }, [realtime, fetchChats]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openToast = useCallback(
    (conversationId, toastId) => {
      dismissToast(toastId);
      handleSelect(conversationId);
    },
    [dismissToast, handleSelect],
  );

  const MessageClick = useCallback(async (formData) => {
    const res = await send_messages(formData);
    await fetchChats(); // pulls the new message back in via the same list fetch
    return res;
  }, [fetchChats]);

  const activeMessages = useMemo(
    () => (activeId ? extractMessages(chats, activeId) : null),
    [chats, activeId],
  );

  return (
    /* Sit below the fixed navbar (h-16 / md:h-18) and fill the rest.
       When a thread is full-screen on mobile, the Navbar is hidden, so
       the page reclaims that space instead of leaving a blank gap. */
    <div className={isFullscreenThread ? "" : "pt-[64px] md:pt-[72px]"}>
      <RealtimeToasts toasts={toasts} onDismiss={dismissToast} onOpen={openToast} />

      <div
        className={[
          "flex flex-col",
          isFullscreenThread ? "h-[100dvh]" : "h-[calc(100dvh-64px)] md:h-[calc(100dvh-72px)]",
        ].join(" ")}
      >

        {/* ── Split-pane workspace ───────────────────────────────
             No page-level title here — the sidebar (ConversationList)
             carries the "Messages" title + unread badge on its own. ──── */}
        <div
          className="
            flex-1 min-h-0
            flex overflow-hidden
            bg-white dark:bg-gray-950
          "
        >
          {/* LEFT — Conversation list sidebar */}
          <aside
            className={[
              "flex flex-col border-e border-gray-100 dark:border-gray-800",
              "bg-white dark:bg-gray-950",
              "md:w-[340px] lg:w-[380px] md:flex-none md:flex",
              activeId ? "hidden" : "flex w-full",
            ].join(" ")}
          >
            <ConversationList
              conversations={chats}
              activeId={activeId}
              onSelect={handleSelect}
              onBack={handleGoBack}
            />
          </aside>

          {/* RIGHT — Chat thread or empty state */}
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
                messages={activeMessages ?? []}
                messagesLoading={false}
                onBack={handleBack}
                SendMessageApi={MessageClick}
              />
            ) : (
              <EmptyConversationState />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ── Main export — Suspense boundary required for useSearchParams ── */
export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-64px)] md:h-[calc(100dvh-72px)] items-center justify-center pt-[64px] md:pt-[72px]" />
      }
    >
      <MessagesInner />
    </Suspense>
  );
}