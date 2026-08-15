"use client";

import { useEffect, useState } from "react";

/**
 * hooks/useSplashScreen.js
 *
 * Drives the one-time brand splash (components/shared/SplashScreen.jsx)
 * shown on first load of a browser tab session — not on every internal
 * navigation.
 *
 *  - sessionStorage (not localStorage): resets per tab session, so it
 *    reads as a fresh "app launch" moment without becoming a permanent
 *    once-ever gate.
 *  - Skipped entirely for prefers-reduced-motion users.
 *  - Renders nothing during SSR / first paint — `show` starts false and
 *    only flips true inside an effect once we've confirmed (client-side)
 *    that this tab hasn't seen it yet. That keeps SSR and the first
 *    client render identical, so there is no hydration-mismatch risk.
 *  - Marks itself seen synchronously as soon as it decides to show, so a
 *    fast double-mount (e.g. React strict-mode / rapid nav) can't
 *    trigger it twice.
 */

const SESSION_KEY = "vb_splash_seen";
const ENTER_HOLD_MS = 1600; // logo fully visible before the zoom-out begins
const EXIT_MS = 550; // logo zoom-fade-out duration, then the overlay unmounts

export function useSplashScreen() {
  const [show, setShow] = useState(false);
  const [stage, setStage] = useState("enter"); // "enter" | "exit"

  useEffect(() => {
    let reduceMotion = false;
    let alreadySeen = true;

    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage/matchMedia unavailable (privacy mode, SSR edge case) —
      // fail closed and simply skip the splash rather than risk a crash.
      return;
    }

    if (reduceMotion || alreadySeen) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    setShow(true);

    const toExit = setTimeout(() => setStage("exit"), ENTER_HOLD_MS);
    const unmount = setTimeout(() => setShow(false), ENTER_HOLD_MS + EXIT_MS);

    return () => {
      clearTimeout(toExit);
      clearTimeout(unmount);
    };
  }, []);

  return { show, stage };
}
