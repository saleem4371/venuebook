"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

// ─── Storage ───────────────────────────────────────────────────────────────────
const SESSION_KEY = "vb_onboarding_seen";      // sessionStorage — per browser session
const LS_KEY      = "vb_onboarding_last_seen"; // localStorage  — 24 h cooldown
const COOLDOWN    = 24 * 60 * 60 * 1000;

/** Returns true if onboarding should be shown right now. */
function shouldShowOnboarding() {
  try {
    // Already seen this session (page refresh, route navigation) — suppress
    if (sessionStorage.getItem(SESSION_KEY)) return false;
    // Check 24 h cooldown
    const ts = localStorage.getItem(LS_KEY);
    if (ts && Date.now() - Number(ts) < COOLDOWN) return false;
    return true;
  } catch { return true; }
}

/** Call once when onboarding first appears. Prevents re-show for this session + 24 h. */
function markOnboardingSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
    localStorage.setItem(LS_KEY, String(Date.now()));
  } catch {}
}

// ─── Platform detection ────────────────────────────────────────────────────────
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

// ─── Overlay shell ─────────────────────────────────────────────────────────────
// On mobile  → bottom sheet (slides up)
// On desktop → centered modal (fade + scale)
function Overlay({ open, onClose, children }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobile,  setMobile]  = useState(false);

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

  // ── MOBILE: bottom sheet with dark backdrop ──
  if (mobile) {
    return createPortal(
      <>
        {/* Backdrop — mobile only */}
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: "fixed", inset: 0, zIndex: 9990,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />
        {/* Sheet */}
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed", left: 0, right: 0, bottom: 0,
            zIndex: 9991,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            transform: visible ? "translateY(0)" : "translateY(110%)",
            transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
          }}
        >
          <div style={{
            background: "white", borderRadius: "24px 24px 0 0",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.18)", overflow: "hidden",
          }}>
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: "#E5E7EB" }} />
            </div>
            {children}
          </div>
        </div>
      </>,
      document.body
    );
  }

  // ── DESKTOP: floating bottom-right card, no backdrop ──
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        bottom: 24, right: 24,
        zIndex: 9991,
        width: 420,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div style={{
        background: "white",
        borderRadius: 24,
        boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 2px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>
        {children}
      </div>
    </div>,
    document.body
  );
}

// ─── Install Sheet ─────────────────────────────────────────────────────────────
function InstallSheet({ onDone }) {
  const [open,         setOpen]         = useState(false);
  const [installEvent, setInstallEvent] = useState(null);
  const [showFallback, setShowFallback] = useState(false); // inline fallback after button tap
  const ios      = isIosSafari();
  const timerRef = useRef(null);

  useEffect(() => {
    console.log("[PWA] InstallSheet init", {
      standalone: isStandalone(),
      ios,
      hasDeferredPrompt: !!window.__pwaInstallEvent,
    });

    if (isStandalone()) { onDone?.(); return; }

    if (window.__pwaInstallEvent) setInstallEvent(window.__pwaInstallEvent);

    const onPrompt = (e) => {
      e.preventDefault();
      console.log("[PWA] beforeinstallprompt captured");
      window.__pwaInstallEvent = e;
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS: always show (no prompt event available)
    // Chrome/Android: show if event already available, or wait 2 s
    if (ios) {
      timerRef.current = setTimeout(() => setOpen(true), 800);
    } else if (window.__pwaInstallEvent) {
      timerRef.current = setTimeout(() => setOpen(true), 800);
    } else {
      timerRef.current = setTimeout(() => {
        if (window.__pwaInstallEvent) { setInstallEvent(window.__pwaInstallEvent); setOpen(true); }
        else { onDone?.(); } // browser doesn't support install → skip
      }, 2000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      clearTimeout(timerRef.current);
    };
  }, [onDone, ios]);

  // Event arrived between init and timer — open immediately
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
    if (installEvent) {
      // Native prompt available — call it immediately
      console.log("[PWA] calling prompt()");
      installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      console.log("[PWA] userChoice:", outcome);
      window.__pwaInstallEvent = null;
      if (outcome === "accepted") window.__pwaInstalled = true;
      setOpen(false);
      setTimeout(() => onDone?.(), 400);
    } else {
      // No native prompt (non-Chrome desktop, Samsung browser, etc.) — show inline instructions
      setShowFallback(true);
    }
  }, [installEvent, onDone]);

  return (
    <Overlay open={open} onClose={dismiss}>
      <div style={{ padding: "28px 24px 32px" }}>

        {/* Brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px rgba(124,58,237,0.35)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2.5"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 2 }}>venuebook.in</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              Add to Home Screen
            </div>
          </div>
        </div>

        {/* Value props */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { icon: "⚡", label: "Instant access" },
            { icon: "🔔", label: "Live alerts"    },
            { icon: "📍", label: "Offline ready"  },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              flex: 1, textAlign: "center",
              background: "#F9FAFB", borderRadius: 16, padding: "14px 8px",
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Fallback instructions — shown after button tap when no native prompt */}
        {(ios || showFallback) && (
          <div style={{
            background: "#F5F3FF", borderRadius: 14, padding: "14px 16px",
            marginBottom: 16, fontSize: 13, color: "#5B21B6", lineHeight: 1.7,
          }}>
            {ios ? (
              <>Tap <strong>Share ↑</strong> then <strong>Add to Home Screen</strong></>
            ) : (
              <>Open your browser menu and tap <strong>Install App</strong> or <strong>Add to Home Screen</strong></>
            )}
          </div>
        )}

        {/* Primary CTA — always enabled */}
        <button
          onClick={handleInstall}
          style={{
            width: "100%", padding: "15px 0", borderRadius: 16,
            fontSize: 15, fontWeight: 700, color: "white", border: "none",
            background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)",
            boxShadow: "0 6px 20px rgba(124,58,237,0.38)",
            cursor: "pointer",
          }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {showFallback ? "Got it" : "Install App"}
        </button>

        <button
          onClick={dismiss}
          style={{
            width: "100%", padding: "12px 0", marginTop: 10, borderRadius: 16,
            fontSize: 14, fontWeight: 500, color: "#9CA3AF",
            background: "none", border: "none", cursor: "pointer",
          }}
        >
          Maybe Later
        </button>
      </div>
    </Overlay>
  );
}

// ─── Notification Sheet ────────────────────────────────────────────────────────
function NotificationSheet({ onDone }) {
  const [open,       setOpen]       = useState(false);
  const [permission, setPermission] = useState(null);

  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("[PWA] NotificationSheet: API unavailable");
      onDone?.();
      return;
    }
    const perm = Notification.permission;
    setPermission(perm);
    console.log("[PWA] NotificationSheet", { permission: perm });

    if (perm !== "default") { onDone?.(); return; }

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
        const result = await Notification.requestPermission();
        console.log("[PWA] Notification.requestPermission:", result);
      } catch (e) {
        console.warn("[PWA] requestPermission error:", e);
      } finally {
        onDone?.();
      }
    }, 400);
  }, [onDone]);

  if (permission !== "default") return null;

  return (
    <Overlay open={open} onClose={dismiss}>
      <div style={{ padding: "28px 24px 32px" }}>

        {/* Brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: "linear-gradient(135deg,#f43f5e 0%,#f97316 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px rgba(244,63,94,0.35)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f43f5e", marginBottom: 2 }}>venuebook.in</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>Stay in the Loop</div>
          </div>
        </div>

        {/* Value props */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            { icon: "📅", label: "Bookings"  },
            { icon: "💬", label: "Replies"   },
            { icon: "🎁", label: "Offers"    },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              flex: 1, textAlign: "center",
              background: "#FFF1F2", borderRadius: 16, padding: "14px 8px",
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Primary CTA — calls requestPermission directly */}
        <button
          onClick={handleEnable}
          style={{
            width: "100%", padding: "15px 0", borderRadius: 16,
            fontSize: 15, fontWeight: 700, color: "white", border: "none",
            background: "linear-gradient(135deg,#f43f5e 0%,#f97316 100%)",
            boxShadow: "0 6px 20px rgba(244,63,94,0.35)",
            cursor: "pointer",
            transition: "transform 0.15s",
          }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Enable Notifications
        </button>

        <button
          onClick={dismiss}
          style={{
            width: "100%", padding: "12px 0", marginTop: 10, borderRadius: 16,
            fontSize: 14, fontWeight: 500, color: "#9CA3AF",
            background: "none", border: "none", cursor: "pointer",
          }}
        >
          Not Now
        </button>
      </div>
    </Overlay>
  );
}

// ─── Orchestrator ──────────────────────────────────────────────────────────────
export default function PWABottomSheets() {
  const [phase,   setPhase]   = useState(null);   // null = checking
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (shouldShowOnboarding()) {
      console.log("[PWA] Onboarding eligible — starting flow");
      markOnboardingSeen(); // mark immediately so refresh/navigation won't re-show
      setPhase("notify");
    } else {
      console.log("[PWA] Onboarding suppressed — seen this session or within 24 h");
      setPhase("done");
    }
  }, []);

  if (!mounted || phase === null || phase === "done") return null;

  if (phase === "notify")  return <NotificationSheet onDone={() => setPhase("install")} />;
  if (phase === "install") return <InstallSheet      onDone={() => setPhase("done")}    />;
  return null;
}
