"use client";

/**
 * /vendor/bookings — Legacy redirect
 *
 * The top-level bookings entry point now redirects to the unified
 * Reservations workspace. All existing sub-routes remain intact:
 *   /vendor/bookings/new
 *   /vendor/bookings/booking
 *   /vendor/bookings/reserve
 *   /vendor/bookings/draft
 *   /vendor/bookings/quotation
 *   /vendor/bookings/history
 */

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function BookingsRedirect() {
  const router = useRouter();
  const params = useParams();
  const target = `/${params?.locale}/${params?.country}/vendor/reservations`;

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return null;
}
