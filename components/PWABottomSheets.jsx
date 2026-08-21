"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

const SESSION_KEY = "vb_onboarding_seen";
const LS_KEY = "vb_onboarding_last_seen";
const COOLDOWN = 24 * 60 * 60 * 1000;

function shouldShowOnboarding() {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return false;
    const ts = localStorage.getItem(LS_KEY);
    if (ts && Date.now() - Number(ts) < COOLDOWN) return false;
    return true;
  } catch {
    return true;
  }
}

function markOnboardingSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
    localStorage.setItem(LS_KEY, String(Date.now()));
  } catch {}
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIosSafari() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);
}

function Overlay({ open, onClose, children }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      );
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 380);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  if (mobile) {
    return createPortal(
      <>
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9990,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9991,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            transform: visible ? "translateY(0)" : "translateY(110%)",
            transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-t-[24px] shadow-2xl border-t border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
            {children}
          </div>
        </div>
      </>,
      document.body
    );
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9991,
        width: 420,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {children}
      </div>
    </div>,
    document.body
  );
}

function InstallSheet({ onDone, directOpen = false }) {
  const [open, setOpen] = useState(directOpen);
  const [installEvent, setInstallEvent] = useState(null);
  const [showFallback, setShowFallback] = useState(false);
  const ios = isIosSafari();
  const timerRef = useRef(null);

  useEffect(() => {
    if (directOpen) {
      setOpen(true);
      return;
    }

    if (isStandalone()) {
      onDone?.();
      return;
    }

    if (window.__pwaInstallEvent) {
      setInstallEvent(window.__pwaInstallEvent);
    }

    const onPrompt = (e) => {
      e.preventDefault();
      window.__pwaInstallEvent = e;
      setInstallEvent(e);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);

    if (ios) {
      timerRef.current = setTimeout(() => setOpen(true), 800);
    } else if (window.__pwaInstallEvent) {
      timerRef.current = setTimeout(() => setOpen(true), 800);
    } else {
      timerRef.current = setTimeout(() => {
        if (window.__pwaInstallEvent) {
          setInstallEvent(window.__pwaInstallEvent);
          setOpen(true);
        } else {
          onDone?.();
        }
      }, 2000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      clearTimeout(timerRef.current);
    };
  }, [onDone, ios, directOpen]);

  useEffect(() => {
    if (!installEvent || open) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timerRef.current);
  }, [installEvent, open]);

  const dismiss = useCallback(() => {
    setOpen(false);
    setTimeout(() => onDone?.(), 400);
  }, [onDone]);

  const handleInstall = useCallback(async () => {
    const promptEvt = installEvent || window.__pwaInstallEvent;
    if (promptEvt) {
      promptEvt.prompt();
      const { outcome } = await promptEvt.userChoice;
      window.__pwaInstallEvent = null;
      if (outcome === "accepted") {
        window.__pwaInstalled = true;
      }
      setOpen(false);
      setTimeout(() => onDone?.(), 400);
    } else {
      setShowFallback(true);
    }
  }, [installEvent, onDone]);

  return (
    <Overlay open={open} onClose={dismiss}>
      <div className="p-7 sm:p-8">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-13 h-13 rounded-2xl shrink-0 bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2.5" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-purple-600 dark:text-purple-400 mb-0.5">
              venuebook.in
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Add to Home Screen
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {[
            { icon: "⚡", label: "Instant access" },
            { icon: "🔔", label: "Live alerts" },
            { icon: "📍", label: "Offline ready" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex-1 text-center bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="text-2xl mb-1.5">{icon}</div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {(ios || showFallback) && (
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/40 rounded-2xl p-4 mb-4 text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
            {ios ? (
              <>Tap <strong>Share ↑</strong> then <strong>Add to Home Screen</strong></>
            ) : (
              <>Open your browser menu and tap <strong>Install App</strong> or <strong>Add to Home Screen</strong></>
            )}
          </div>
        )}

        <button
          onClick={handleInstall}
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] transition-all cursor-pointer"
        >
          {showFallback ? "Got it" : "Install App"}
        </button>

        <button
          onClick={dismiss}
          className="w-full py-2.5 mt-2 rounded-2xl text-xs font-medium text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          Maybe Later
        </button>
      </div>
    </Overlay>
  );
}

function NotificationSheet({ onDone }) {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState(null);

  useEffect(() => {
    if (!("Notification" in window)) {
      onDone?.();
      return;
    }
    const perm = Notification.permission;
    setPermission(perm);

    if (perm !== "default") {
      onDone?.();
      return;
    }

    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, [onDone]);

  const dismiss = useCallback(() => {
    setOpen(false);
    setTimeout(() => onDone?.(), 400);
  }, [onDone]);

  const handleEnable = useCallback(async () => {
    setOpen(false);
    setTimeout(async () => {
      try {
        await Notification.requestPermission();
      } catch {} finally {
        onDone?.();
      }
    }, 400);
  }, [onDone]);

  if (permission !== "default") return null;

  return (
    <Overlay open={open} onClose={dismiss}>
      <div className="p-7 sm:p-8">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-13 h-13 rounded-2xl shrink-0 bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-rose-500 mb-0.5">
              venuebook.in
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Stay in the Loop
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { icon: "📅", label: "Bookings" },
            { icon: "💬", label: "Replies" },
            { icon: "🎁", label: "Offers" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex-1 text-center bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-3.5 border border-rose-100 dark:border-rose-900/30"
            >
              <div className="text-2xl mb-1.5">{icon}</div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleEnable}
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-orange-500 shadow-lg shadow-rose-500/30 hover:from-rose-600 hover:to-orange-600 active:scale-[0.98] transition-all cursor-pointer"
        >
          Enable Notifications
        </button>

        <button
          onClick={dismiss}
          className="w-full py-2.5 mt-2 rounded-2xl text-xs font-medium text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          Not Now
        </button>
      </div>
    </Overlay>
  );
}

export function PWABottomSheets() {
  const [phase, setPhase] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (shouldShowOnboarding()) {
      markOnboardingSeen();
      setPhase("notify");
    } else {
      setPhase("done");
    }

    const handleOpenGuide = () => {
      setPhase("install");
    };

    window.addEventListener("pwa-open-install-guide", handleOpenGuide);
    return () => window.removeEventListener("pwa-open-install-guide", handleOpenGuide);
  }, []);

  if (!mounted || phase === null || phase === "done") return null;

  if (phase === "notify") return <NotificationSheet onDone={() => setPhase("install")} />;
  if (phase === "install") return <InstallSheet onDone={() => setPhase("done")} directOpen={true} />;
  return null;
}

export default PWABottomSheets;
