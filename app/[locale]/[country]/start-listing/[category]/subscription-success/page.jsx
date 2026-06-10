"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { verify_subscription } from "@/services/payment.service";


export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const param = useParams();

  const locale = param?.locale || "en";
  const country = param?.country || "in";

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your subscription...");

  useEffect(() => {
    const verify = async () => {
      try {
        const subscriptionId = searchParams.get("subscription_id");

        if (!subscriptionId) {
          setStatus("failed");
          setMessage("Invalid subscription link");
          return;
        }

        const res = await verify_subscription(subscriptionId);

        const subscriptionStatus =
          res?.data?.subscription_status || res?.subscription_status;

        if (subscriptionStatus === "ACTIVE" || subscriptionStatus === "BANK_APPROVAL_PENDING") {
          localStorage.removeItem("vb_pending_category");

          setStatus("success");
          setMessage("Subscription activated successfully");

          setTimeout(() => {
            router.push(`/${locale}/${country}/vendor/dashboard`);
          }, 1800);
        } else {
          setStatus("failed");
          setMessage("Subscription is not active yet");
        }
      } catch (err) {
        setStatus("failed");
        setMessage("Verification failed. Please try again.");
      }
    };

    verify();
  }, [searchParams, router, locale, country]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">

      <div className="max-w-md w-full text-center">

        {/* ICON */}
        <div className="mb-6 flex justify-center">
          {status === "loading" && (
            <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
          )}

          {status === "success" && (
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-2xl border border-green-100">
              ✓
            </div>
          )}

          {status === "failed" && (
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 text-2xl border border-red-100">
              ✕
            </div>
          )}
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {status === "loading" && "Processing Payment"}
          {status === "success" && "Subscription Active"}
          {status === "failed" && "Verification Failed"}
        </h1>

        {/* MESSAGE */}
        <p className="text-gray-500 text-sm mb-6">
          {message}
        </p>

        {/* LOADING DOTS */}
        {status === "loading" && (
          <div className="flex justify-center gap-1 mb-6">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
          </div>
        )}

        {/* ACTION BUTTON */}
        {status === "success" && (
          <button
            onClick={() =>
              router.push(`/${locale}/${country}/vendor/dashboard`)
            }
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition"
          >
            Go to Dashboard
          </button>
        )}

        {status === "failed" && (
          <button
            onClick={() => router.back()}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition"
          >
            Try Again
          </button>
        )}

        {/* FOOTER NOTE */}
        <p className="text-xs text-gray-400 mt-6">
          Please do not refresh while we verify your payment
        </p>
      </div>
    </div>
  );
}