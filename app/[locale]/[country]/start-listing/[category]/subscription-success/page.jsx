"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { verify_subscription } from "@/services/payment.service";

// ─── Lightweight canvas confetti ────────────────────────────────────────────
function launchConfetti(canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ["#a44bf3", "#499ce8", "#f97316", "#22c55e", "#ec4899", "#facc15"];
  const TOTAL   = 180;

  const particles = Array.from({ length: TOTAL }, () => ({
    x:     Math.random() * canvas.width,
    y:     -20 - Math.random() * 60,
    r:     4 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    tilt:  (Math.random() - 0.5) * 20,
    tiltSpd: 0.1 + Math.random() * 0.2,
    spd:   2.5 + Math.random() * 3.5,
    drift: (Math.random() - 0.5) * 1.5,
    opacity: 1,
    shape: Math.random() > 0.5 ? "rect" : "circle",
    angle: Math.random() * Math.PI * 2,
    angleSpd: (Math.random() - 0.5) * 0.15,
  }));

  let raf;
  let tick = 0;

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tick++;

    particles.forEach((p) => {
      p.y      += p.spd;
      p.x      += p.drift;
      p.tilt   += p.tiltSpd;
      p.angle  += p.angleSpd;
      if (p.y > canvas.height * 0.7) p.opacity -= 0.018;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;

      if (p.shape === "rect") {
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.5);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    const alive = particles.some((p) => p.opacity > 0 && p.y < canvas.height);
    if (alive) raf = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  raf = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(raf);
}

// ─── Status states ───────────────────────────────────────────────────────────
// "loading" | "success_paid" | "success_later" | "failed"

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const param        = useParams();

  const locale  = param?.locale  || "en";
  const country = param?.country || "in";

  const [status,  setStatus]  = useState("loading");
  const [message, setMessage] = useState("Verifying your subscription…");
  const canvasRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const subscriptionId = searchParams.get("subscription_id");

        if (!subscriptionId) {
          setStatus("failed");
          setMessage("Invalid subscription link.");
          return;
        }

        const res = await verify_subscription(subscriptionId);
        const subscriptionStatus = res?.data?.subscription_status || res?.subscription_status;

        if (subscriptionStatus === "ACTIVE" || subscriptionStatus === "BANK_APPROVAL_PENDING") {
          localStorage.removeItem("vb_pending_category");

          let payType = "pay_now";
          try { payType = localStorage.getItem("vb_payment_type") || "pay_now"; } catch (_) {}
          try { localStorage.removeItem("vb_payment_type"); } catch (_) {}

          if (payType === "pay_later") {
            setMessage("Your listing is saved. Complete payment anytime from your dashboard.");
            setStatus("success_later");
          } else {
            setMessage("Your listing is now live on venuebook.in!");
            setStatus("success_paid");
          }

          setTimeout(() => {
            router.push(`/${locale}/${country}/vendor/dashboard`);
          }, payType === "pay_later" ? 6000 : 5000);
        } else {
          setStatus("failed");
          setMessage("Subscription is not active yet. Please try again or contact support.");
        }
      } catch (err) {
        setStatus("failed");
        setMessage("Verification failed. Please try again.");
      }
    };

    verify();
  }, [searchParams, router, locale, country]);

  // Trigger confetti when paid success
  useEffect(() => {
    if (status === "success_paid" && canvasRef.current) {
      // Small delay to let the animation render first
      const t = setTimeout(() => {
        cleanupRef.current = launchConfetti(canvasRef.current);
      }, 200);
      return () => {
        clearTimeout(t);
        cleanupRef.current?.();
      };
    }
  }, [status]);

  const goToDashboard = useCallback(() => {
    router.push(`/${locale}/${country}/vendor/dashboard`);
  }, [router, locale, country]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden px-6">

      {/* Confetti canvas (paid only) */}
      {status === "success_paid" && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 z-50"
          style={{ width: "100vw", height: "100vh" }}
        />
      )}

      {/* Subtle background glow */}
      {(status === "success_paid" || status === "success_later") && (
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: status === "success_paid"
              ? "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(164,75,243,0.07) 0%, transparent 70%)"
              : "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(73,156,232,0.07) 0%, transparent 70%)",
          }}
        />
      )}

      <div className="relative z-10 w-full max-w-sm text-center">

        {/* ── LOADING ── */}
        {status === "loading" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" style={{ animationDuration: "1.4s" }} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Verifying Payment</h1>
              <p className="text-sm text-gray-400 mt-2">Please wait, this only takes a moment…</p>
            </div>
            <div className="flex justify-center gap-1.5">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-300">Do not refresh this page</p>
          </div>
        )}

        {/* ── SUCCESS — PAID ── */}
        {status === "success_paid" && (
          <div className="space-y-6">
            {/* Animated icon */}
            <div className="flex justify-center">
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(164,75,243,0.12), rgba(73,156,232,0.12))",
                  border: "2px solid rgba(164,75,243,0.2)",
                  animation: "pop 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
                }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="20" fill="url(#grad-paid)" fillOpacity="0.15" />
                  <path
                    d="M11 20.5l6.5 6.5L29 13"
                    stroke="url(#grad-paid)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: "draw 0.5s 0.2s ease forwards", strokeDasharray: 40, strokeDashoffset: 40 }}
                  />
                  <defs>
                    <linearGradient id="grad-paid" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#a44bf3" />
                      <stop offset="1" stopColor="#499ce8" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#a44bf3" }}>
                🎉 Payment Successful
              </p>
              <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
                Welcome to the Family!
              </h1>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Your payment was successful and your venue is ready to go live. Set it up now to start receiving bookings.
              </p>
            </div>

            {/* Stats strip */}
            <div className="flex divide-x divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
              {[
                { label: "Status",  value: "Active",    color: "#22c55e" },
                { label: "Visible", value: "Instantly", color: "#a44bf3" },
                { label: "Billing", value: "Confirmed", color: "#499ce8" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex-1 py-3.5 px-2 text-center bg-gray-50/60">
                  <p className="text-[11px] text-gray-400 font-medium">{label}</p>
                  <p className="text-[13px] font-bold mt-0.5" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="space-y-2.5">
              <button
                onClick={() => router.push(`/${locale}/${country}/vendor/listing`)}
                className="w-full py-3.5 rounded-xl font-bold text-white text-[15px] transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-violet-200/50"
                style={{ background: "linear-gradient(135deg, #a44bf3, #499ce8)" }}
              >
                Setup Venue →
              </button>
              <button
                onClick={goToDashboard}
                className="w-full py-3 rounded-xl font-semibold text-[14px] border border-gray-200 text-gray-600 hover:border-gray-300 transition-all"
              >
                Dashboard
              </button>
              <p className="text-xs text-gray-400 text-center">Redirecting automatically in a few seconds…</p>
            </div>
          </div>
        )}

        {/* ── SUCCESS — PAY LATER ── */}
        {status === "success_later" && (
          <div className="space-y-5 text-left" style={{ maxWidth: "400px" }}>
            {/* Icon + heading */}
            <div className="flex flex-col items-center text-center gap-3">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(73,156,232,0.08)",
                  border: "2px solid rgba(73,156,232,0.2)",
                  animation: "pop 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
                }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M18 6v12l7 4" stroke="#499ce8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="18" cy="18" r="13" stroke="#499ce8" strokeWidth="2" strokeDasharray="4 3" />
                </svg>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-1">
                  Listing Active
                </p>
                <h1 className="text-[24px] font-bold text-gray-900 leading-snug">
                  Your venue listing is now active.
                </h1>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Your first subscription payment is scheduled for next month.
                </p>
              </div>
            </div>

            {/* Status badge + investment due */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-4 space-y-3">
              {/* Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  1 Venue Active
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
                  Pending First Payment
                </span>
              </div>

              {/* Investment due */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    Investment Due
                  </p>
                  <p className="text-[22px] font-extrabold text-gray-900 leading-tight mt-0.5">
                    ₹470
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400">Due next month</p>
                  <p className="text-[11px] font-medium text-blue-500 mt-0.5">Auto-scheduled</p>
                </div>
              </div>
            </div>

            {/* What's next */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                What&apos;s Next
              </p>
              <div className="space-y-2">
                {[
                  { icon: "📋", title: "Listing Saved", body: "Your listing details are securely stored and visible to guests." },
                  { icon: "💳", title: "Pay When Ready", body: "Complete payment from your dashboard anytime before the due date." },
                  { icon: "🚀", title: "Instant Boost", body: "Your listing gets priority placement once payment clears." },
                ].map(({ icon, title, body }) => (
                  <div key={title} className="flex items-start gap-3 rounded-xl bg-white border border-gray-100 px-4 py-3.5">
                    <span className="text-base leading-none mt-0.5">{icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">{title}</p>
                      <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete your profile */}
            <div className="rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">✨</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-violet-900">Complete your profile</p>
                  <p className="text-[12px] text-violet-700/80 mt-1 leading-relaxed">
                    Take this time to perfect your profile and add high-quality photos to maximize your bookings.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-2.5">
              <button
                onClick={goToDashboard}
                className="w-full py-3.5 rounded-xl font-bold text-white text-[15px] transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #499ce8, #6366f1)" }}
              >
                Go to Dashboard →
              </button>
              <p className="text-xs text-gray-400 text-center">Redirecting automatically in a few seconds…</p>
            </div>
          </div>
        )}

        {/* ── FAILED ── */}
        {status === "failed" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M10 10l12 12M22 10L10 22" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Verification Failed</h1>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{message}</p>
            </div>
            <div className="space-y-2.5">
              <button
                onClick={() => router.back()}
                className="w-full py-3 rounded-xl font-semibold text-white text-[14px] bg-red-500 hover:bg-red-600 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={goToDashboard}
                className="w-full py-3 rounded-xl font-semibold text-gray-600 text-[14px] border border-gray-200 hover:border-gray-300 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes pop {
          0%   { transform: scale(0.6); opacity: 0; }
          70%  { transform: scale(1.08); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
