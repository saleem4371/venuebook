"use client";

/* ══════════════════════════════════════════════════════════════════
   MESSAGES PAGE — Full Dedicated Inbox
   ─────────────────────────────────────
   Structure/view mirrors the customer-facing Messages page 1:1 (see
   app/[locale]/[country]/messages/page.jsx) — edge-to-edge split pane,
   no separate page-header card, title + unread badge live inside the
   ConversationList sidebar header instead. Data source, category
   taxonomy (guests/leads/bookings/team/support/system) and the
   all_messages() API call are untouched — only presentation changed.

   Layout:
     Desktop : Left sidebar (conversation list) + Right panel (chat)
     Tablet  : Adaptive split — sidebar collapses at md breakpoint
     Mobile  : Stacked — list screen → tap → full chat screen

   URL pattern (consistent with Reservations):
     ?conversation=<id>  → active conversation

   No modal, no popover, no dropdown — this is a dedicated full page.
   The vendor shell (layout.jsx) already supplies the top offset
   (navbar height) and left inset (VendorSidebar width) for this
   full-bleed route, so this page only owns its own fill-height.
══════════════════════════════════════════════════════════════════ */

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";

import ConversationList   from "./components/ConversationList";
import ChatThread         from "./components/ChatThread";

import { all_messages } from '@/services/chat.service'

/* ── Empty state (desktop: no conversation selected) ─────────────── */
function EmptyConversationState() {
  const t = useTranslations("vendor.messages");
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

/* ── Inner page — requires Suspense for useSearchParams ──────────── */
function MessagesInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  const [chats, setChat] = useState([]);
  const activeId   = searchParams.get("conversation");
  const activeConv = chats.find((c) => String(c.id) === activeId) ?? null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // API call
        const res = await all_messages();
        setChat(res?.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        // if (interval) clearInterval(interval);
      }
    };

    fetchData();
  }, []);

  /* Navigate to a conversation — preserves other search params.
     Uses replace (not push), matching the customer Messages page:
     switching conversations is in-page UI state, not a new navigable
     page — push would stack a history entry per conversation opened,
     so the back button would have to walk through all of them before
     it could leave the page at all. */
  const handleSelect = useCallback(
    (id) => {
      const p = new URLSearchParams(searchParams);
      p.set("conversation", id);
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  /* Back to conversation list (mobile) — same reasoning, replace only. */
  const handleBack = useCallback(() => {
    const p = new URLSearchParams(searchParams);
    p.delete("conversation");
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  /* Leave the Messages page entirely — mirrors the customer page's
     back arrow in the sidebar header. */
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    /*
      Full-bleed, edge-to-edge — no card chrome (no margin/border/
      rounded/shadow). Matches the customer Messages page exactly,
      including HOW it gets its height: a self-computed
      h-[calc(100dvh-Npx)], the same 64px/72px navbar offset
      AdminLayout's own wrapper already reserves via pt- for this
      route. That makes this box's own size independent of whatever
      flexbox is doing in the ancestors between here and the shell —
      it doesn't need h-full or flex-1 to propagate correctly through
      motion.main/AdminLayout, it just states its own final size.
    */
    <div className="h-[calc(100dvh-64px)] md:h-[calc(100dvh-72px)] flex overflow-hidden bg-white dark:bg-gray-950">

      {/* LEFT — Conversation list sidebar */}
      <aside
        className={[
          "flex flex-col min-h-0 border-e border-gray-100 dark:border-gray-800",
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
          onBack={handleGoBack}
        />
      </aside>

      {/* RIGHT — Chat thread or empty state */}
      <section
        className={[
          "flex-1 flex flex-col min-w-0 min-h-0",
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
  );
}

/* ── Main export — Suspense boundary required for useSearchParams ── */
export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100dvh-64px)] md:h-[calc(100dvh-72px)] flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <MessagesInner />
    </Suspense>
  );
}
