"use client";

/**
 * /vendor/leads — Legacy redirect
 *
 * Leads have been folded into the unified Reservations workspace.
 * This page silently redirects to /vendor/reservations?tab=leads
 * so that any bookmarked or linked URLs continue to work.
 */

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function LeadsRedirect() {
  const router = useRouter();
  const params = useParams();
  const target = `/${params?.locale}/${params?.country}/vendor/reservations?tab=leads`;

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return null;
}
