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

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";

import { useUI } from "@/context/UIContext";
import ConversationList from "./components/ConversationList";
import ChatThread       from "./components/ChatThread";
import { MOCK_CONVERSATIONS } from "./_data";

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

/* ── Inner page — requires Suspense for useSearchParams ──────────── */
function MessagesInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const { setHideSiteChrome } = useUI();

  /* Active conversation from URL */
  const activeId   = searchParams.get("conversation");
  const activeConv = MOCK_CONVERSATIONS.find((c) => String(c.id) === activeId) ?? null;

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
    /* Sit below the fixed navbar (h-16 / md:h-18) and fill the rest.
       When a thread is full-screen on mobile, the Navbar is hidden, so
       the page reclaims that space instead of leaving a blank gap. */
    <div className={isFullscreenThread ? "" : "pt-[64px] md:pt-[72px]"}>
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
              conversations={MOCK_CONVERSATIONS}
              activeId={activeId}
              onSelect={handleSelect}
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
              <ChatThread conversation={activeConv} onBack={handleBack} />
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
