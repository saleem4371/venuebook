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
══════════════════════════════════════════════════════════════════ */

import { Suspense, useCallback ,useEffect,useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";

import PageHeader         from "../components/PageHeader";
import ConversationList   from "./components/ConversationList";
import ChatThread         from "./components/ChatThread";
import { MOCK_CONVERSATIONS } from "./_data";

import { all_messages } from '@/services/chat.service'

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

    const [chats, setChat] = useState([]);
  const activeId   = searchParams.get("conversation");
const activeConv =
  chats.find((c) => String(c.id) === activeId) ?? null;

const totalUnread = chats.reduce(
  (sum, c) => sum + (c.unread || 0),
  0
);


  useEffect(() => {
    
  
    const fetchData = async () => {
      try {
        // Start progress bar
       
  
        // API call
        const res = await all_messages();
        setChat(res?.data?.data || null);
  
      
  
      } catch (err) {
        console.error(err);
       
      } finally {
        // if (interval) clearInterval(interval);
      }
    };
  
    fetchData();
  
   
  }, []);

  /* Active conversation from URL */

  // const activeConv = chats.find((c) => c.id === activeId) ?? null;

  /* Total unread badge for the page header */
  // const totalUnread = chats.reduce((s, c) => s + c.unread, 0);

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

  return (
    /*
      Full-bleed wrapper.
      - layout.jsx strips horizontal padding + pb-24 + space-y-6 for this route
      - We own all padding/spacing here for full viewport control
      - Height fills from below the fixed navbar to the bottom of the viewport:
          mobile: 100dvh − 120px navbar offset
          desktop: 100dvh − 140px navbar offset
    */
    <div className="flex flex-col h-[calc(100dvh-120px)] md:h-[calc(100dvh-140px)]">

      {/* ── Page header ────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10  pb-4 shrink-0">
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          badge={
            totalUnread > 0 ? (
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-violet-600 dark:bg-violet-500 px-1.5 text-[11px] font-bold text-white leading-none">
                {totalUnread}
              </span>
            ) : undefined
          }
        />
      </div>

      {/* ── Split-pane workspace ────────────────────────────────── */}
      {/*
        The workspace fills the remaining height after the header.
        Uses a borderless card that matches the global shadow/card style.

        Desktop : Left sidebar (340px / lg:380px) | Right thread panel (flex-1)
        Mobile  : sidebar OR thread — toggled via `activeId` URL param
                  (pure CSS, no JS state toggle)
      */}
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

        {/* LEFT — Conversation list sidebar */}
        <aside
          className={[
            "flex flex-col border-r border-gray-100 dark:border-gray-800",
            "bg-white dark:bg-gray-950",
            /* Desktop: always visible with fixed width */
            "md:w-[340px] lg:w-[380px] md:flex-none md:flex",
            /* Mobile: full-width when no conversation open, hidden when one is open */
            activeId ? "hidden" : "flex w-full",
          ].join(" ")}
        >
          <ConversationList
            conversations={chats}
            activeId={activeId}
            onSelect={handleSelect}
          />
        </aside>

        {/* DIVIDER — visible desktop only */}
        {/* (handled by border-r on aside) */}

        {/* RIGHT — Chat thread or empty state */}
        <section
          className={[
            "flex-1 flex flex-col min-w-0",
            "bg-white dark:bg-gray-950",
            /* Mobile: visible only when a conversation is active */
            activeId ? "flex" : "hidden md:flex",
          ].join(" ")}
        >
          {activeConv ? (
            <ChatThread
              conversation={activeConv}
              onBack={handleBack}
            />
          ) : (
            <EmptyConversationState />
          )}
        </section>

      </div>
    </div>
  );
}

// /* ── Main export — Suspense boundary required for useSearchParams ── */
// export default function MessagesPage() {
//   return (
//     <Suspense fallback={null}>
//       <MessagesInner />
//     </Suspense>
//   );
// }

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