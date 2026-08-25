"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  useSearchParams,
  useRouter,
  useParams,
} from "next/navigation";

import {
  verify_razorpay_subscription,
  verify_stripe_subscription,
} from "@/services/payment.service";

// =========================================================
// CONFETTI
// =========================================================

function launchConfetti(canvas) {
  const ctx = canvas.getContext("2d");

  canvas.width =
    window.innerWidth;

  canvas.height =
    window.innerHeight;

  const COLORS = [
    "#a44bf3",
    "#499ce8",
    "#f97316",
    "#22c55e",
    "#ec4899",
    "#facc15",
  ];

  const TOTAL = 180;

  const particles =
    Array.from(
      { length: TOTAL },
      () => ({
        x:
          Math.random() *
          canvas.width,

        y:
          -20 -
          Math.random() *
            60,

        r:
          4 +
          Math.random() *
            6,

        color:
          COLORS[
            Math.floor(
              Math.random() *
                COLORS.length,
            )
          ],

        tilt:
          (Math.random() - 0.5) *
          20,

        tiltSpd:
          0.1 +
          Math.random() *
            0.2,

        spd:
          2.5 +
          Math.random() *
            3.5,

        drift:
          (Math.random() - 0.5) *
          1.5,

        opacity: 1,

        shape:
          Math.random() > 0.5
            ? "rect"
            : "circle",

        angle:
          Math.random() *
          Math.PI *
          2,

        angleSpd:
          (Math.random() - 0.5) *
          0.15,
      }),
    );

  let raf;

  const draw = () => {
    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    particles.forEach((p) => {
      p.y += p.spd;

      p.x += p.drift;

      p.tilt += p.tiltSpd;

      p.angle += p.angleSpd;

      if (
        p.y >
        canvas.height * 0.7
      ) {
        p.opacity -= 0.018;
      }

      ctx.save();

      ctx.globalAlpha =
        Math.max(
          0,
          p.opacity,
        );

      ctx.translate(
        p.x,
        p.y,
      );

      ctx.rotate(
        p.angle,
      );

      ctx.fillStyle =
        p.color;

      if (
        p.shape ===
        "rect"
      ) {
        ctx.fillRect(
          -p.r / 2,
          -p.r / 2,
          p.r,
          p.r * 0.5,
        );
      } else {
        ctx.beginPath();

        ctx.arc(
          0,
          0,
          p.r / 2,
          0,
          Math.PI * 2,
        );

        ctx.fill();
      }

      ctx.restore();
    });

    const alive =
      particles.some(
        (p) =>
          p.opacity > 0 &&
          p.y <
            canvas.height,
      );

    if (alive) {
      raf =
        requestAnimationFrame(
          draw,
        );
    } else {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height,
      );
    }
  };

  raf =
    requestAnimationFrame(
      draw,
    );

  return () =>
    cancelAnimationFrame(
      raf,
    );
}

// =========================================================
// SUCCESS PAGE
// =========================================================

export default function SuccessPage() {
  const searchParams =
    useSearchParams();

  const router =
    useRouter();

  const params =
    useParams();

  const locale =
    params?.locale || "en";

  const country =
    params?.country || "in";

  const [status, setStatus] =
    useState("loading");

  const [message, setMessage] =
    useState(
      "Verifying your payment…",
    );

  const canvasRef =
    useRef(null);

  const cleanupRef =
    useRef(null);

  // =========================================================
  // VERIFY PAYMENT
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const sleep = (ms) =>
      new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            ms,
          ),
      );

    const verifyPayment =
      async () => {
        try {
          // =================================================
          // PAYMENT SKIPPED
          // =================================================

          const paymentStatus =
            searchParams.get(
              "payment_status",
            );

          if (
            paymentStatus ===
            "skipped"
          ) {
            localStorage.removeItem(
              "vb_pending_category",
            );

            localStorage.removeItem(
              "vb_payment_type",
            );

            if (cancelled)
              return;

            setMessage(
              "Your listing is now active. Complete payment anytime from your dashboard.",
            );

            setStatus(
              "success_skipped",
            );

            setTimeout(() => {
              if (!cancelled) {
                router.push(
                  `/${locale}/${country}/vendor/dashboard`,
                );
              }
            }, 6000);

            return;
          }

          // =================================================
          // URL PARAMETERS
          // =================================================

          const subscriptionId =
            searchParams.get(
              "subscription_id",
            );

          const sessionId =
            searchParams.get(
              "session_id",
            );

          const paymentId =
            searchParams.get(
              "payment_id",
            );

          const callbackStatus =
            searchParams.get(
              "status",
            );

          console.log(
            "SUCCESS PAGE PARAMETERS:",
            {
              subscriptionId,
              sessionId,
              paymentId,
              callbackStatus,
            },
          );

          // =================================================
          // NO ID
          // =================================================

          if (
            !subscriptionId &&
            !sessionId
          ) {
            setStatus(
              "failed",
            );

            setMessage(
              "Invalid subscription link.",
            );

            return;
          }

          // =================================================
          // RETRY
          // =================================================

          const MAX_ATTEMPTS =
            8;

          const RETRY_DELAY =
            1500;

          for (
            let attempt = 1;
            attempt <=
              MAX_ATTEMPTS;
            attempt++
          ) {
            if (
              cancelled
            ) {
              return;
            }

            console.log(
              `Verification attempt ${attempt}/${MAX_ATTEMPTS}`,
            );

            try {
              let res;

              // =================================================
              // RAZORPAY
              // =================================================

              if (
                subscriptionId
              ) {
                res =
                  await verify_razorpay_subscription(
                    subscriptionId,
                  );
              }

              // =================================================
              // STRIPE
              // =================================================

              else if (
                sessionId
              ) {
                res =
                  await verify_stripe_subscription(
                    sessionId,
                  );
              }

              console.log(
                "Verification response:",
                res,
              );

              const data =
                res?.data ||
                res;

              const subscriptionStatus =
                data?.subscription_status ||
                data?.status ||
                data
                  ?.subscription
                  ?.status;

              const paymentStatus =
                data?.payment_status;

              console.log(
                "Subscription status:",
                subscriptionStatus,
              );

              console.log(
                "Payment status:",
                paymentStatus,
              );

              // =================================================
              // SUCCESS
              // =================================================

              const isSuccessful =
                subscriptionStatus ===
                  "ACTIVE" ||
                subscriptionStatus ===
                  "active" ||
                subscriptionStatus ===
                  "paid" ||
                subscriptionStatus ===
                  "PAID" ||
                paymentStatus ===
                  "paid" ||
                paymentStatus ===
                  "PAID" ||
                callbackStatus ===
                  "paid";

              if (
                isSuccessful
              ) {
                if (
                  cancelled
                ) {
                  return;
                }

                localStorage.removeItem(
                  "vb_pending_category",
                );

                const payType =
                  localStorage.getItem(
                    "vb_payment_type",
                  ) ||
                  "pay_now";

                localStorage.removeItem(
                  "vb_payment_type",
                );

                // =============================================
                // PAY LATER
                // =============================================

                if (
                  payType ===
                  "pay_later"
                ) {
                  setMessage(
                    "Your listing is saved. Complete payment anytime from your dashboard.",
                  );

                  setStatus(
                    "success_later",
                  );
                }

                // =============================================
                // PAID
                // =============================================

                else {
                  setMessage(
                    "Your payment was successful and your venue is ready to go live.",
                  );

                  setStatus(
                    "success_paid",
                  );
                }

                setTimeout(
                  () => {
                    if (
                      !cancelled
                    ) {
                      router.push(
                        `/${locale}/${country}/vendor/dashboard`,
                      );
                    }
                  },
                  payType ===
                    "pay_later"
                    ? 6000
                    : 5000,
                );

                return;
              }

              // =================================================
              // NOT READY
              // =================================================

              if (
                attempt <
                MAX_ATTEMPTS
              ) {
                setMessage(
                  "Confirming your payment with Razorpay…",
                );

                await sleep(
                  RETRY_DELAY,
                );
              }
            } catch (error) {
              console.error(
                `Verification attempt ${attempt} error:`,
                error,
              );

              // ===============================================
              // DON'T FAIL IMMEDIATELY
              // ===============================================

              if (
                attempt <
                MAX_ATTEMPTS
              ) {
                setMessage(
                  "Confirming your payment with Razorpay…",
                );

                await sleep(
                  RETRY_DELAY,
                );
              }
            }
          }

          // =================================================
          // FINAL FAILURE
          // =================================================

          if (
            cancelled
          ) {
            return;
          }

          setStatus(
            "failed",
          );

          setMessage(
            "We could not confirm your payment yet. Please try again or contact support.",
          );
        } catch (error) {
          console.error(
            "Payment verification error:",
            error,
          );

          if (
            cancelled
          ) {
            return;
          }

          setStatus(
            "failed",
          );

          setMessage(
            "We could not verify your payment. Please try again.",
          );
        }
      };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [
    searchParams,
    router,
    locale,
    country,
  ]);

  // =========================================================
  // CONFETTI
  // =========================================================

  useEffect(() => {
    if (
      status ===
        "success_paid" &&
      canvasRef.current
    ) {
      const timer =
        setTimeout(() => {
          cleanupRef.current =
            launchConfetti(
              canvasRef.current,
            );
        }, 200);

      return () => {
        clearTimeout(timer);

        cleanupRef.current?.();
      };
    }
  }, [status]);

  // =========================================================
  // DASHBOARD
  // =========================================================

  const goToDashboard =
    useCallback(() => {
      router.push(
        `/${locale}/${country}/vendor/dashboard`,
      );
    }, [
      router,
      locale,
      country,
    ]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden px-6">

      {/* CONFETTI */}

      {status ===
        "success_paid" && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            width: "100vw",
            height: "100vh",
          }}
        />
      )}

      {/* BACKGROUND */}

      {(
        [
          "success_paid",
          "success_later",
          "success_skipped",
        ].includes(status)
      ) && (
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              status ===
              "success_paid"
                ? "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(164,75,243,0.07) 0%, transparent 70%)"
                : "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(73,156,232,0.07) 0%, transparent 70%)",
          }}
        />
      )}

      {/* CONTENT */}

      <div
        key={status}
        className={[
          "relative z-10 w-full text-center",
          status ===
              "success_later" ||
          status ===
              "success_skipped"
            ? "max-w-[400px]"
            : "max-w-sm",
          status !==
            "loading"
            ? "animate-successEnter"
            : "",
        ].join(" ")}
      >

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {status ===
          "loading" && (
          <div className="space-y-6 text-center">

            <div className="flex justify-center">
              <div className="relative w-20 h-20">

                <div className="absolute inset-0 rounded-full border-4 border-gray-100" />

                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />

                <div
                  className="absolute inset-2 rounded-full border-2 border-transparent border-t-blue-400 animate-spin"
                  style={{
                    animationDuration:
                      "1.4s",
                  }}
                />

              </div>
            </div>

            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Verifying Payment
              </h1>

              <p className="text-sm text-gray-400 mt-2">
                {message}
              </p>
            </div>

            <div className="flex justify-center gap-1.5">
              {[0, 150, 300].map(
                (delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                    style={{
                      animationDelay:
                        `${delay}ms`,
                    }}
                  />
                ),
              )}
            </div>

            <p className="text-xs text-gray-300">
              Please do not refresh
              this page
            </p>
          </div>
        )}

        {/* ================================================= */}
        {/* SUCCESS PAID */}
        {/* ================================================= */}

        {status ===
          "success_paid" && (
          <div className="space-y-6">

            <div className="flex justify-center">
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(164,75,243,0.12), rgba(73,156,232,0.12))",
                  border:
                    "2px solid rgba(164,75,243,0.2)",
                  animation:
                    "pop 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
                }}
              >

                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="20"
                    fill="url(#grad-paid)"
                    fillOpacity="0.15"
                  />

                  <path
                    d="M11 20.5l6.5 6.5L29 13"
                    stroke="url(#grad-paid)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      animation:
                        "draw 0.5s 0.2s ease forwards",
                      strokeDasharray:
                        40,
                      strokeDashoffset:
                        40,
                    }}
                  />

                  <defs>
                    <linearGradient
                      id="grad-paid"
                      x1="0"
                      y1="0"
                      x2="40"
                      y2="40"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#a44bf3" />
                      <stop
                        offset="1"
                        stopColor="#499ce8"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div>

              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{
                  color: "#a44bf3",
                }}
              >
                🎉 Payment Successful
              </p>

              <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
                Welcome to the Family!
              </h1>

              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Your payment was
                successful and your
                venue is ready to go
                live.
              </p>
            </div>

            <div className="flex divide-x divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">

              <div className="flex-1 py-3.5 px-2 text-center bg-gray-50/60">
                <p className="text-[11px] text-gray-400 font-medium">
                  Status
                </p>

                <p className="text-[13px] font-bold mt-0.5 text-green-500">
                  Active
                </p>
              </div>

              <div className="flex-1 py-3.5 px-2 text-center bg-gray-50/60">
                <p className="text-[11px] text-gray-400 font-medium">
                  Payment
                </p>

                <p className="text-[13px] font-bold mt-0.5 text-violet-500">
                  Paid
                </p>
              </div>

              <div className="flex-1 py-3.5 px-2 text-center bg-gray-50/60">
                <p className="text-[11px] text-gray-400 font-medium">
                  Billing
                </p>

                <p className="text-[13px] font-bold mt-0.5 text-blue-500">
                  Confirmed
                </p>
              </div>

            </div>

            <div className="space-y-2.5">

              <button
                onClick={() =>
                  router.push(
                    `/${locale}/${country}/vendor/listing`,
                  )
                }
                className="w-full py-3.5 rounded-xl font-bold text-white text-[15px] transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-violet-200/50"
                style={{
                  background:
                    "linear-gradient(135deg, #a44bf3, #499ce8)",
                }}
              >
                Setup Venue →
              </button>

              <button
                onClick={
                  goToDashboard
                }
                className="w-full py-3 rounded-xl font-semibold text-[14px] border border-gray-200 text-gray-600 hover:border-gray-300 transition-all"
              >
                Dashboard
              </button>

              <p className="text-xs text-gray-400 text-center">
                Redirecting automatically…
              </p>

            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* SUCCESS LATER */}
        {/* ================================================= */}

        {status ===
          "success_later" && (
          <div className="space-y-5">

            <div className="flex flex-col items-center text-center gap-3">

              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "rgba(73,156,232,0.08)",
                  border:
                    "2px solid rgba(73,156,232,0.2)",
                  animation:
                    "pop 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
                }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                >
                  <path
                    d="M18 6v12l7 4"
                    stroke="#499ce8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <circle
                    cx="18"
                    cy="18"
                    r="13"
                    stroke="#499ce8"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                </svg>
              </div>

              <div>

                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-1">
                  Listing Active
                </p>

                <h1 className="text-[24px] font-bold text-gray-900 leading-snug">
                  Your venue listing
                  is now active.
                </h1>

                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Your first
                  subscription payment
                  is scheduled for next
                  month.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-4">

              <div className="flex items-center gap-2 flex-wrap">

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  1 Venue Active
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
                  Pending First Payment
                </span>

              </div>
            </div>

            <div className="space-y-2">

              {[
                {
                  icon: "📋",
                  title:
                    "Listing Saved",
                  body:
                    "Your listing details are securely stored.",
                },
                {
                  icon: "💳",
                  title:
                    "Pay When Ready",
                  body:
                    "Complete payment from your dashboard.",
                },
                {
                  icon: "🚀",
                  title:
                    "Instant Boost",
                  body:
                    "Your listing gets priority once payment clears.",
                },
              ].map(
                ({
                  icon,
                  title,
                  body,
                }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-xl bg-white border border-gray-100 px-4 py-3.5"
                  >
                    <span className="text-base">
                      {icon}
                    </span>

                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">
                        {title}
                      </p>

                      <p className="text-[12px] text-gray-500 mt-0.5">
                        {body}
                      </p>
                    </div>
                  </div>
                ),
              )}

            </div>

            <button
              onClick={
                goToDashboard
              }
              className="w-full py-3.5 rounded-xl font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, #499ce8, #6366f1)",
              }}
            >
              Go to Dashboard →
            </button>

          </div>
        )}

        {/* ================================================= */}
        {/* SKIPPED */}
        {/* ================================================= */}

        {status ===
          "success_skipped" && (
          <div className="space-y-5">

            <div className="flex flex-col items-center text-center gap-3">

              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "rgba(73,156,232,0.08)",
                  border:
                    "2px solid rgba(73,156,232,0.2)",
                }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="13"
                    stroke="#499ce8"
                    strokeWidth="2"
                  />

                  <path
                    d="M11 18.5l4.5 4.5L25 13"
                    stroke="#499ce8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>

                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
                  Listing Active
                </p>

                <h1 className="text-[24px] font-bold text-gray-900">
                  You&apos;re live —
                  payment skipped
                  for now.
                </h1>

                <p className="text-sm text-gray-500 mt-2">
                  Complete payment
                  anytime from your
                  dashboard.
                </p>

              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-4">

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
                Payment Skipped
              </span>

            </div>

            <button
              onClick={
                goToDashboard
              }
              className="w-full py-3.5 rounded-xl font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, #499ce8, #6366f1)",
              }}
            >
              Go to Dashboard →
            </button>

          </div>
        )}

        {/* ================================================= */}
        {/* FAILED */}
        {/* ================================================= */}

        {status ===
          "failed" && (
          <div className="space-y-6">

            <div className="flex justify-center">

              <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">

                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <path
                    d="M10 10l12 12M22 10L10 22"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>

              </div>
            </div>

            <div>

              <h1 className="text-xl font-semibold text-gray-900">
                Verification Failed
              </h1>

              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                {message}
              </p>

            </div>

            <div className="space-y-2.5">

              <button
                onClick={() =>
                  window.location.reload()
                }
                className="w-full py-3 rounded-xl font-semibold text-white text-[14px] bg-red-500 hover:bg-red-600"
              >
                Try Again
              </button>

              <button
                onClick={
                  goToDashboard
                }
                className="w-full py-3 rounded-xl font-semibold text-gray-600 text-[14px] border border-gray-200"
              >
                Go to Dashboard
              </button>

            </div>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* ANIMATIONS */}
      {/* ================================================= */}

      <style jsx>{`
        @keyframes pop {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }

          70% {
            transform: scale(1.08);
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes successEnter {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-successEnter {
          animation:
            successEnter
            0.45s
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            )
            forwards;
        }
      `}</style>
    </div>
  );
}