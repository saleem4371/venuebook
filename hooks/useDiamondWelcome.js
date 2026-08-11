"use client";

/**
 * hooks/useDiamondWelcome.js
 *
 * Detects "this account is Diamond tier and just logged in" and exposes
 * a controlled `open` flag for <DiamondWelcomeModal />.
 *
 * Fires on every login (per explicit product decision — this used to be
 * a one-time-ever moment gated by a localStorage flag; that gate has
 * been removed). "Login" here means every transition of `isLoggedIn`
 * from false → true: a fresh page load with an existing session cookie,
 * or an explicit login while already on the page after a prior logout.
 * It will NOT re-fire on ordinary client-side navigation between pages
 * while already logged in, since that isn't a new login.
 *
 * Why this exists instead of reusing a tier hook: there isn't one yet.
 * Tier data (`rewads.name`) is only ever fetched today from the account
 * settings and checkout pages via the existing `rewardsApi()` service
 * (see account.service.js) — nothing loads it globally. This hook adds
 * exactly one such call per login. No new endpoint, no second loyalty
 * system — same `rewardsApi()` + same `rewads.name` field
 * TierStepper/MemberCard already treat as the source of truth for the
 * account's real current tier (see Rewards.jsx's TierStepper, which
 * lowercases `tier.name` for the same purpose).
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { rewardsApi } from "@/services/account.service";

/** Fixed welcome bonus amount shown in the modal. Not derived from the
 *  account's live points balance — the balance reflects every
 *  transaction ever earned, not just this credit, and the API has no
 *  separate "bonus this event" figure to read instead. Matches the
 *  amount stated in the Diamond upgrade email. */
export const DIAMOND_WELCOME_BONUS_POINTS = 20000;

export function useDiamondWelcome() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const wasLoggedInRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;

    const justLoggedIn = isLoggedIn && !wasLoggedInRef.current;
    wasLoggedInRef.current = isLoggedIn;

    if (!justLoggedIn || !user) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await rewardsApi();
        // `rewads` is the account's real current-tier record when present
        // (absent for accounts still on mock/no real loyalty data yet —
        // those simply never see this modal).
        const tierName = res?.data?.rewads?.name;
        const isDiamond = typeof tierName === "string" && tierName.toLowerCase() === "diamond";
        if (!cancelled && isDiamond) {
          setOpen(true);
        }
      } catch (_) {
        // Silent — a failed rewards check should never block the app or
        // surface an error for what is a purely celebratory UI moment.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn, user]);

  const dismiss = useCallback(() => {
    setOpen(false);
  }, []);

  return { open, dismiss, bonusPoints: DIAMOND_WELCOME_BONUS_POINTS };
}
