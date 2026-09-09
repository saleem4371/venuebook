"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { isEligibleForPWAInstall, supportsPWAInstall, isIosSafari, isAppStandalone } from "@/lib/pwa/pwaUtils";
import { useModal } from "@/context/ModalContext";

const PWA_DISMISSED_SESSION = "vb_pwa_dismissed";
const PWA_DISMISSED_TIME = "vb_pwa_dismissed_at";
const LEGACY_SESSION_KEY = "vb_onboarding_seen";
const LEGACY_LS_KEY = "vb_onboarding_last_seen";
const COOLDOWN = 24 * 60 * 60 * 1000;

function shouldShowPwaPrompt() {
  try {
    if (sessionStorage.getItem(PWA_DISMISSED_SESSION) === "true") return false;
    if (sessionStorage.getItem(LEGACY_SESSION_KEY) === "true") return false;
    if (localStorage.getItem("vb_pwa_installed") === "true") return false;

    const ts = localStorage.getItem(PWA_DISMISSED_TIME) || localStorage.getItem(LEGACY_LS_KEY);
    if (ts && Date.now() - Number(ts) < COOLDOWN) return false;

    return true;
  } catch {
    return true;
  }
}

function markPwaDismissed() {
  try {
    sessionStorage.setItem(PWA_DISMISSED_SESSION, "true");
    sessionStorage.setItem(LEGACY_SESSION_KEY, "true");
    localStorage.setItem(PWA_DISMISSED_TIME, String(Date.now()));
    localStorage.setItem(LEGACY_LS_KEY, String(Date.now()));
  } catch {}
}

function Overlay({ open, onClose, children }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
        maxWidth: "calc(100vw - 48px)",
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

function InstallSheet({ onDone, onDismiss, onInstalled }) {
  const [open, setOpen] = useState(true);
  const [installEvent, setInstallEvent] = useState(null);
  const [showFallback, setShowFallback] = useState(false);
  const ios = isIosSafari();

  useEffect(() => {
    if (typeof window !== "undefined" && window.__pwaInstallEvent) {
      setInstallEvent(window.__pwaInstallEvent);
    }
    const onInstallable = () => {
      setInstallEvent(window.__pwaInstallEvent);
    };
    window.addEventListener("pwa-installable", onInstallable);
    return () => window.removeEventListener("pwa-installable", onInstallable);
  }, []);

  const dismiss = useCallback(() => {
    setOpen(false);
    onDismiss ? onDismiss() : onDone?.();
  }, [onDismiss, onDone]);

  const handleInstall = useCallback(async () => {
    if (showFallback || ios) {
      dismiss();
      return;
    }
    const promptEvt = installEvent || window.__pwaInstallEvent;
    if (promptEvt) {
      promptEvt.prompt();
      const { outcome } = await promptEvt.userChoice;
      window.__pwaInstallEvent = null;
      if (outcome === "accepted") {
        window.__pwaInstalled = true;
        onInstalled ? onInstalled() : dismiss();
      } else {
        dismiss();
      }
    } else {
      setShowFallback(true);
    }
  }, [installEvent, showFallback, dismiss, ios, onInstalled]);

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
          {showFallback || ios ? "Got it" : "Install App"}
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

function NotificationSheet({ onDone, onDismiss }) {
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

    setOpen(true);
  }, [onDone]);

  const dismiss = useCallback(() => {
    setOpen(false);
    onDismiss ? onDismiss() : onDone?.();
  }, [onDismiss, onDone]);

  const handleEnable = useCallback(async () => {
    setOpen(false);
    try {
      await Notification.requestPermission();
    } catch {} finally {
      onDone?.();
    }
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
  const { requestModal, releaseModal, canShow, requestedModals } = useModal();
  const [phase, setPhase] = useState(null);
  const [hasInstallEvent, setHasInstallEvent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined" && window.__pwaInstallEvent) {
      setHasInstallEvent(true);
    }

    const onInstallable = () => setHasInstallEvent(true);
    const onInstalled = () => {
      setPhase("done");
      releaseModal("pwa");
    };

    window.addEventListener("pwa-installable", onInstallable);
    window.addEventListener("pwa-installed", onInstalled);

    return () => {
      window.removeEventListener("pwa-installable", onInstallable);
      window.removeEventListener("pwa-installed", onInstalled);
    };
  }, [releaseModal]);

  const handleDismiss = useCallback(() => {
    markPwaDismissed();
    setPhase("done");
    releaseModal("pwa");
  }, [releaseModal]);

  const handleInstalled = useCallback(() => {
    try {
      localStorage.setItem("vb_pwa_installed", "true");
    } catch {}
    setPhase("done");
    releaseModal("pwa");
  }, [releaseModal]);

  useEffect(() => {
    if (!mounted || phase === "done") return;

    if (!isEligibleForPWAInstall() || !shouldShowPwaPrompt()) {
      if (phase !== null) setPhase("done");
      releaseModal("pwa");
      return;
    }

    const higherPriorityActive = Boolean(
      requestedModals?.onboarding ||
      requestedModals?.cookie_preferences ||
      requestedModals?.auth ||
      (typeof window !== "undefined" && localStorage.getItem("vb_onboarding_completed") !== "1")
    );

    if (higherPriorityActive) {
      if (phase === "install") {
        releaseModal("pwa");
      }
      return;
    }

    if (!supportsPWAInstall()) {
      return;
    }

    requestModal("pwa");
    setPhase("install");
  }, [mounted, phase, requestedModals, hasInstallEvent, requestModal, releaseModal]);

  useEffect(() => {
    const handleOpenGuide = () => {
      if (isEligibleForPWAInstall()) {
        requestModal("pwa");
        setPhase("install");
      }
    };
    window.addEventListener("pwa-open-install-guide", handleOpenGuide);
    return () => {
      window.removeEventListener("pwa-open-install-guide", handleOpenGuide);
    };
  }, [requestModal]);

  if (!mounted || phase !== "install" || !canShow("pwa")) return null;

  return (
    <InstallSheet
      onDone={() => {
        setPhase("done");
        releaseModal("pwa");
      }}
      onDismiss={handleDismiss}
      onInstalled={handleInstalled}
    />
  );
}

export default PWABottomSheets;
